import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchPubliccode, parseGitHubUrl } from '@/lib/github';
import { getDb, hashUrl, COLLECTIONS } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { parse, validate, scoreYaml } from '@godwana/publiccode-core';

const MIN_SCORE = 60;

interface RegisterRepoRequest {
  repoUrl: string;
}

interface RegisterRepoResponse {
  success: boolean;
  message: string;
  project?: {
    name: string;
    description: string;
    url: string;
    score: number;
    categories: string[];
  };
  error?: string;
  errorCode?: string;
  editorUrl?: string;
  validationErrors?: string[];
}

// POST /api/repos/register - Register a repository by URL
export async function POST(request: NextRequest): Promise<NextResponse<RegisterRepoResponse>> {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'Du måste vara inloggad med GitHub för att registrera projekt.',
          errorCode: 'unauthenticated'
        },
        { status: 401 }
      );
    }

    // Parse request body
    let body: RegisterRepoRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Ogiltig request body', errorCode: 'invalid_body' },
        { status: 400 }
      );
    }

    const { repoUrl } = body;

    if (!repoUrl || typeof repoUrl !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Repo-URL saknas', errorCode: 'missing_url' },
        { status: 400 }
      );
    }

    // Validate GitHub URL format
    const parsedUrl = parseGitHubUrl(repoUrl);
    if (!parsedUrl) {
      return NextResponse.json(
        {
          success: false,
          message: 'Ogiltig GitHub-URL. Ange en URL som https://github.com/owner/repo',
          errorCode: 'invalid_url'
        },
        { status: 400 }
      );
    }

    // Fetch publiccode.yml from the repo
    const fetchResult = await fetchPubliccode(repoUrl, session.accessToken);

    if (!fetchResult.success || !fetchResult.content) {
      // No publiccode.yml found
      const editorUrl = `/editor?repo=${encodeURIComponent(repoUrl)}`;

      return NextResponse.json(
        {
          success: false,
          message: fetchResult.error || 'Kunde inte hämta publiccode.yml',
          errorCode: fetchResult.errorCode || 'fetch_error',
          editorUrl,
        },
        { status: fetchResult.errorCode === 'not_found' ? 404 : 400 }
      );
    }

    const yamlContent = fetchResult.content;

    // Validate the publiccode.yml (validate() also parses internally)
    const validationResult = validate(yamlContent);

    if (!validationResult.valid) {
      const errorMessages = validationResult.errors.map(e => e.message);
      return NextResponse.json(
        {
          success: false,
          message: 'publiccode.yml har valideringsfel',
          errorCode: 'validation_error',
          validationErrors: errorMessages,
          editorUrl: `/editor?repo=${encodeURIComponent(repoUrl)}`,
        },
        { status: 400 }
      );
    }

    // Calculate score
    const scoreResult = scoreYaml(yamlContent);

    if (scoreResult.total < MIN_SCORE) {
      return NextResponse.json(
        {
          success: false,
          message: `Projektet behöver minst ${MIN_SCORE} poäng för att registreras. Nuvarande poäng: ${scoreResult.total}`,
          errorCode: 'score_too_low',
          editorUrl: `/editor?repo=${encodeURIComponent(repoUrl)}`,
        },
        { status: 400 }
      );
    }

    // Parse YAML for data extraction
    let publiccodeData;
    try {
      publiccodeData = parse(yamlContent);
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: 'publiccode.yml kunde inte parsas.',
          errorCode: 'parse_error',
          editorUrl: `/editor?repo=${encodeURIComponent(repoUrl)}`,
        },
        { status: 400 }
      );
    }

    // Get categories from publiccode data
    const categories = publiccodeData.categories || [];

    // Normalize the repo URL
    const normalizedUrl = `https://github.com/${parsedUrl.owner}/${parsedUrl.repo}`;

    // Prepare document data
    const db = getDb();
    const urlHash = hashUrl(normalizedUrl);
    const docRef = db.collection(COLLECTIONS.REPOSITORIES).doc(urlHash);

    const existingDoc = await docRef.get();
    const isUpdate = existingDoc.exists;

    // Extract localized content (prefer Swedish, then English, then any language)
    const getLocalizedDescription = () => {
      const desc = publiccodeData.description;
      if (!desc) return null;
      // Try Swedish first, then English, then first available
      return desc.sv || desc.en || Object.values(desc)[0] || null;
    };

    const localizedDesc = getLocalizedDescription();

    // Extract individual fields from localized description
    const shortDescription = localizedDesc?.shortDescription || '';
    const longDescription = localizedDesc?.longDescription || '';
    const features = localizedDesc?.features || [];
    const documentation = localizedDesc?.documentation || '';
    const apiDocumentation = localizedDesc?.apiDocumentation || '';
    const screenshots = localizedDesc?.screenshots || [];
    const videos = localizedDesc?.videos || [];
    const localisedName = localizedDesc?.localisedName || '';

    // Extract maintenance contacts
    const contacts = publiccodeData.maintenance?.contacts || [];
    const contractors = publiccodeData.maintenance?.contractors || [];

    // Extract localisation info
    const localisationReady = publiccodeData.localisation?.localisationReady || false;
    const availableLanguages = publiccodeData.localisation?.availableLanguages || [];

    // Extract dependencies
    const dependsOn = publiccodeData.dependsOn || {};

    const documentData = {
      url: normalizedUrl,
      name: publiccodeData.name || parsedUrl.repo,
      localisedName,

      // Descriptions
      shortDescription: shortDescription.slice(0, 300),
      longDescription: longDescription.slice(0, 5000),
      // Keep 'description' for backward compatibility (used in catalog list)
      description: shortDescription.slice(0, 300),

      // Core metadata
      score: scoreResult.total,
      categories: categories,
      disFase1: scoreResult.total >= 80,
      owner: parsedUrl.owner,

      // Software info
      softwareVersion: publiccodeData.softwareVersion || '',
      releaseDate: publiccodeData.releaseDate || '',
      softwareType: publiccodeData.softwareType || 'standalone/other',
      platforms: publiccodeData.platforms || [],

      // Legal
      license: publiccodeData.legal?.license || 'unknown',
      mainCopyrightOwner: publiccodeData.legal?.mainCopyrightOwner || '',
      repoOwner: publiccodeData.legal?.repoOwner || parsedUrl.owner,

      // Status and maintenance
      developmentStatus: publiccodeData.developmentStatus || 'development',
      maintenanceType: publiccodeData.maintenance?.type || 'internal',
      contacts: contacts.map(c => ({
        name: c.name,
        email: c.email || '',
        phone: c.phone || '',
        affiliation: c.affiliation || '',
      })),
      contractors: contractors.map(c => ({
        name: c.name,
        email: c.email || '',
        website: c.website || '',
        until: c.until || '',
      })),

      // Localisation
      localisationReady,
      availableLanguages,

      // Rich content
      features: features.slice(0, 20), // Limit to 20 features
      documentation,
      apiDocumentation,
      screenshots: screenshots.slice(0, 10), // Limit to 10 screenshots
      videos: videos.slice(0, 5), // Limit to 5 videos

      // URLs
      landingURL: publiccodeData.landingURL || '',
      logo: publiccodeData.logo || '',

      // Dependencies
      dependsOn: {
        open: (dependsOn.open || []).slice(0, 20),
        proprietary: (dependsOn.proprietary || []).slice(0, 10),
        hardware: (dependsOn.hardware || []).slice(0, 10),
      },

      // System fields
      urlHash,
      registeredBy: session.user?.login || session.user?.id || 'unknown',
      registeredByLower: (session.user?.login || session.user?.id || 'unknown').toLowerCase(),
      lastUpdated: FieldValue.serverTimestamp(),
      ...(isUpdate ? {} : { registeredAt: FieldValue.serverTimestamp() }),
    };

    await docRef.set(documentData, { merge: true });

    return NextResponse.json({
      success: true,
      message: isUpdate ? 'Projektet uppdaterades i katalogen!' : 'Projektet registrerades i katalogen!',
      project: {
        name: documentData.name,
        description: documentData.description,
        url: documentData.url,
        score: documentData.score,
        categories: documentData.categories,
      },
    });
  } catch (error) {
    console.error('Register repo error:', error);
    return NextResponse.json(
      { success: false, message: 'Ett oväntat fel uppstod', errorCode: 'internal_error' },
      { status: 500 }
    );
  }
}
