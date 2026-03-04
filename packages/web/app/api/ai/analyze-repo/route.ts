import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Anthropic from '@anthropic-ai/sdk';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Check if user has write access to repo (owner, admin, or maintainer)
async function verifyRepoAccess(
  accessToken: string,
  owner: string,
  repo: string,
  userLogin: string
): Promise<{ hasAccess: boolean; reason?: string }> {
  // Check if user is the repo owner (personal repo)
  if (owner.toLowerCase() === userLogin.toLowerCase()) {
    return { hasAccess: true };
  }

  // Check if user has admin/write permissions on the repo
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/collaborators/${userLogin}/permission`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      // 'admin', 'write', or 'maintain' permissions allow registration
      if (['admin', 'write', 'maintain'].includes(data.permission)) {
        return { hasAccess: true };
      }
    }

    // Check if user is admin of the organization that owns the repo
    const orgResponse = await fetch(
      `https://api.github.com/user/memberships/orgs/${owner}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (orgResponse.ok) {
      const membership = await orgResponse.json();
      if (membership.role === 'admin') {
        return { hasAccess: true };
      }
    }

    return {
      hasAccess: false,
      reason: `Du har inte skrivrattigheter till ${owner}/${repo}. Endast agare, administratorer eller maintainers kan registrera projekt.`,
    };
  } catch {
    return {
      hasAccess: false,
      reason: 'Kunde inte verifiera dina rattigheter till repot.',
    };
  }
}

// All valid publiccode.yml categories
const VALID_CATEGORIES = [
  'accounting', 'agile-project-management', 'applicant-tracking', 'application-development',
  'appointment-scheduling', 'backup', 'billing-and-invoicing', 'blog', 'budgeting',
  'business-intelligence', 'business-process-management', 'cad', 'call-center-management',
  'case-management', 'civic-engagement', 'cloud-management', 'collaboration',
  'communications', 'compliance-management', 'contact-management', 'content-management',
  'crm', 'customer-service-and-support', 'data-analytics', 'data-collection',
  'data-visualization', 'design', 'design-system', 'digital-asset-management',
  'digital-citizenship', 'document-management', 'donor-management', 'e-commerce',
  'e-signature', 'educational-content', 'email-management', 'email-marketing',
  'employee-management', 'enterprise-project-management', 'enterprise-social-networking',
  'erp', 'event-management', 'facility-management', 'feedback-and-reviews-management',
  'financial-reporting', 'fleet-management', 'fundraising', 'gamification',
  'geographic-information-systems', 'government-websites', 'grant-management', 'graphic-design',
  'healthcare', 'help-desk', 'hr', 'ide', 'identity-management', 'instant-messaging',
  'integrated-library-system', 'inventory-management', 'it-asset-management', 'it-development',
  'it-management', 'it-security', 'it-service-management', 'knowledge-management',
  'learning-management-system', 'local-government', 'marketing', 'mind-mapping',
  'mobile-marketing', 'mobile-payment', 'network-management', 'office', 'online-booking',
  'online-community', 'payment-gateway', 'payroll', 'predictive-analysis', 'procurement',
  'productivity-suite', 'project-collaboration', 'project-management', 'property-management',
  'public-participation', 'real-estate-management', 'regulations-and-directives',
  'remote-support', 'reporting-issues', 'resource-management', 'sales-management', 'seo',
  'service-desk', 'social-media-management', 'social-services', 'survey', 'talent-management',
  'task-management', 'taxes-management', 'test-management', 'time-management', 'time-tracking',
  'translation', 'transportation', 'video-conferencing', 'video-editing', 'visitor-management',
  'voip', 'voting', 'warehouse-management', 'waste-management', 'web-collaboration',
  'web-conferencing', 'website-builder', 'website-management', 'whistleblowing', 'workflow-management'
];

// Valid platforms
const VALID_PLATFORMS = ['web', 'windows', 'mac', 'linux', 'ios', 'android'];

// Valid development statuses
const VALID_STATUSES = ['concept', 'development', 'beta', 'stable', 'obsolete'];

// Valid software types
const VALID_SOFTWARE_TYPES = [
  'standalone/mobile', 'standalone/iot', 'standalone/desktop', 'standalone/web',
  'standalone/backend', 'standalone/other', 'addon', 'library', 'configurationFiles'
];

// Valid maintenance types
const VALID_MAINTENANCE_TYPES = ['internal', 'contract', 'community', 'none'];

// Common SPDX licenses
const COMMON_LICENSES = [
  'MIT', 'Apache-2.0', 'GPL-3.0-only', 'GPL-3.0-or-later', 'GPL-2.0-only', 'GPL-2.0-or-later',
  'BSD-3-Clause', 'BSD-2-Clause', 'ISC', 'MPL-2.0', 'LGPL-3.0-only', 'LGPL-2.1-only',
  'AGPL-3.0-only', 'Unlicense', 'CC0-1.0', 'EUPL-1.2'
];

interface GitHubRepo {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  license: { spdx_id: string; name: string } | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  default_branch: string;
  owner: {
    login: string;
    type: string;
    avatar_url: string;
  };
}

interface GitHubRelease {
  tag_name: string;
  name: string;
  published_at: string;
  prerelease: boolean;
}

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const cleaned = url.trim().replace(/\.git$/, '');
  const urlMatch = cleaned.match(/(?:https?:\/\/)?github\.com\/([^/]+)\/([^/]+)/);
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2] };
  }
  const simpleMatch = cleaned.match(/^([^/]+)\/([^/]+)$/);
  if (simpleMatch) {
    return { owner: simpleMatch[1], repo: simpleMatch[2] };
  }
  return null;
}

async function fetchRepoData(owner: string, repo: string): Promise<GitHubRepo | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'publiccode-tools',
        },
      }
    );
    if (response.ok) {
      return await response.json();
    }
  } catch {
    return null;
  }
  return null;
}

async function fetchLatestRelease(owner: string, repo: string): Promise<GitHubRelease | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'publiccode-tools',
        },
      }
    );
    if (response.ok) {
      return await response.json();
    }
  } catch {
    return null;
  }
  return null;
}

async function fetchReadme(owner: string, repo: string): Promise<string | null> {
  const readmeFiles = ['README.md', 'readme.md', 'README', 'readme', 'README.rst', 'readme.rst'];

  for (const filename of readmeFiles) {
    try {
      const response = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${filename}`,
        { headers: { 'User-Agent': 'publiccode-tools' } }
      );
      if (response.ok) {
        const content = await response.text();
        // Truncate to avoid token limits
        return content.slice(0, 12000);
      }
    } catch {
      continue;
    }
  }
  return null;
}

async function fetchLicenseFile(owner: string, repo: string): Promise<string | null> {
  const licenseFiles = ['LICENSE', 'LICENSE.md', 'LICENSE.txt', 'license', 'COPYING'];

  for (const filename of licenseFiles) {
    try {
      const response = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${filename}`,
        { headers: { 'User-Agent': 'publiccode-tools' } }
      );
      if (response.ok) {
        const content = await response.text();
        return content.slice(0, 2000);
      }
    } catch {
      continue;
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication with GitHub (need accessToken for API calls)
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.accessToken) {
      return NextResponse.json(
        { error: 'Du maste vara inloggad med GitHub for att analysera repos. Logga ut och in igen om problemet kvarstar.' },
        { status: 401 }
      );
    }

    // Get GitHub username - required for ownership verification
    const userLogin = session.user.login;
    if (!userLogin) {
      return NextResponse.json(
        { error: 'Kunde inte hamta ditt GitHub-anvandarnamn. Logga ut och in igen.' },
        { status: 401 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI-tjansten ar inte konfigurerad. Kontakta administratoren.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'GitHub-URL kravs' },
        { status: 400 }
      );
    }

    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Ogiltig GitHub-URL. Ange en URL som https://github.com/owner/repo' },
        { status: 400 }
      );
    }

    // Verify user has access to this repo (owner, admin, or maintainer)
    const accessCheck = await verifyRepoAccess(
      session.accessToken,
      parsed.owner,
      parsed.repo,
      userLogin
    );

    if (!accessCheck.hasAccess) {
      return NextResponse.json(
        { error: accessCheck.reason || 'Du har inte rattigheter att registrera detta repo.' },
        { status: 403 }
      );
    }

    // Fetch all data in parallel
    const [repoData, latestRelease, readme, licenseFile] = await Promise.all([
      fetchRepoData(parsed.owner, parsed.repo),
      fetchLatestRelease(parsed.owner, parsed.repo),
      fetchReadme(parsed.owner, parsed.repo),
      fetchLicenseFile(parsed.owner, parsed.repo),
    ]);

    if (!repoData) {
      return NextResponse.json(
        { error: 'Kunde inte hitta GitHub-repot. Kontrollera att URL:en ar korrekt och att repot ar publikt.' },
        { status: 404 }
      );
    }

    // Build context for Claude
    let context = `
# GitHub Repository Analysis

## Basic Info
- Name: ${repoData.name}
- Full Name: ${repoData.full_name}
- Description: ${repoData.description || 'No description'}
- URL: ${repoData.html_url}
- Homepage: ${repoData.homepage || 'None'}
- Primary Language: ${repoData.language || 'Unknown'}
- Topics: ${repoData.topics.join(', ') || 'None'}
- Stars: ${repoData.stargazers_count}
- Forks: ${repoData.forks_count}
- Open Issues: ${repoData.open_issues_count}
- Created: ${repoData.created_at}
- Last Updated: ${repoData.updated_at}
- Last Push: ${repoData.pushed_at}

## Owner
- Login: ${repoData.owner.login}
- Type: ${repoData.owner.type}

## License
- GitHub detected: ${repoData.license?.spdx_id || 'Unknown'}
- License name: ${repoData.license?.name || 'Unknown'}
${licenseFile ? `- License file content (first 2000 chars):\n${licenseFile}` : ''}

## Latest Release
${latestRelease ? `
- Version: ${latestRelease.tag_name}
- Name: ${latestRelease.name}
- Published: ${latestRelease.published_at}
- Prerelease: ${latestRelease.prerelease}
` : 'No releases found'}

## README Content
${readme || 'No README found'}
`;

    // Call Claude API for comprehensive analysis
    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: `Du ar en expert pa publiccode.yml-standarden for oppen programvara. Analysera foljande GitHub-repo och generera ett komplett forslag till publiccode.yml-data.

${context}

Generera ett JSON-objekt med foljande struktur. Fyll i SA MANGA falt som mojligt baserat pa informationen ovan:

{
  "name": "projektnamn",
  "url": "github-url",
  "landingURL": "hemsida om finns",
  "softwareVersion": "version fran release om finns",
  "releaseDate": "YYYY-MM-DD fran senaste release",
  "platforms": ["web", "linux", etc - valj fran: ${VALID_PLATFORMS.join(', ')}],
  "categories": ["category1", "category2" - valj 2-5 fran: ${VALID_CATEGORIES.slice(0, 30).join(', ')}...],
  "developmentStatus": "stable|beta|development|concept|obsolete",
  "softwareType": "standalone/web|library|etc - valj fran: ${VALID_SOFTWARE_TYPES.join(', ')}",
  "description": {
    "sv": {
      "shortDescription": "Max 150 tecken, pa svenska",
      "longDescription": "Langre beskrivning 150-500 tecken, pa svenska. Forklara vad projektet gor.",
      "features": ["funktion 1", "funktion 2", "funktion 3"],
      "documentation": "URL till dokumentation om finns"
    },
    "en": {
      "shortDescription": "Max 150 chars in English",
      "longDescription": "Longer description in English",
      "features": ["feature 1", "feature 2", "feature 3"]
    }
  },
  "legal": {
    "license": "SPDX-identifier (t.ex. MIT, Apache-2.0, GPL-3.0-only)",
    "repoOwner": "agare av repot",
    "mainCopyrightOwner": "upphovsrattsagare om annan an repoOwner"
  },
  "maintenance": {
    "type": "internal|community|contract|none",
    "contacts": [
      {
        "name": "Personens fullstandiga namn (t.ex. 'Anna Andersson')",
        "email": "giltig email-adress (t.ex. 'anna@example.com') - INTE namn eller telefon!",
        "affiliation": "organisationsnamn",
        "phone": "telefonnummer i format +46701234567 (valfritt, uteslut om okant)"
      }
    ]
  },
  "localisation": {
    "localisationReady": true/false,
    "availableLanguages": ["en", "sv", etc]
  },
  "intendedAudience": {
    "countries": ["SE", "EU", etc om relevant],
    "scope": ["government", "local-government", etc om relevant]
  }
}

VIKTIGT:
- Skriv beskrivningar pa BADE svenska (sv) och engelska (en)
- Kort beskrivning: max 150 tecken, fokusera pa VAD projektet gor
- Lang beskrivning: 150-500 tecken, mer detaljer
- Features: minst 3 konkreta funktioner/egenskaper
- Gissa INTE pa kontaktuppgifter - anvand bara det som finns i README
- For license: anvand SPDX-identifier (MIT, Apache-2.0, GPL-3.0-only, etc)
- Basera developmentStatus pa aktivitet och releases
- Valj categories som bast beskriver projektets syfte
- KRITISKT for maintenance.contacts:
  * "name" = personens namn (t.ex. "Anna Andersson"), INTE email
  * "email" = giltig email-adress (t.ex. "anna@example.com"), INTE namn eller telefon
  * "phone" = telefonnummer (valfritt, uteslut om det inte finns)
  * Om du inte hittar kontaktinfo, lamna contacts som tom array []
- Inkludera INTE "sv:" extension pa toppniva - den ar inte del av standard publiccode.yml

Svara ENDAST med JSON-objektet, inget annat:`
        }
      ]
    });

    // Parse response
    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';

    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json(
        { error: 'Kunde inte tolka AI-svaret' },
        { status: 500 }
      );
    }

    let suggestion;
    try {
      suggestion = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json(
        { error: 'Kunde inte parsa AI-svaret som JSON' },
        { status: 500 }
      );
    }

    // Validate and clean up the suggestion
    const cleaned = {
      name: suggestion.name || repoData.name,
      url: repoData.html_url,
      landingURL: suggestion.landingURL || repoData.homepage || '',
      softwareVersion: suggestion.softwareVersion || latestRelease?.tag_name?.replace(/^v/, '') || '',
      releaseDate: suggestion.releaseDate || (latestRelease?.published_at ? latestRelease.published_at.split('T')[0] : ''),
      platforms: Array.isArray(suggestion.platforms)
        ? suggestion.platforms.filter((p: string) => VALID_PLATFORMS.includes(p))
        : ['web'],
      categories: Array.isArray(suggestion.categories)
        ? suggestion.categories.filter((c: string) => VALID_CATEGORIES.includes(c)).slice(0, 5)
        : [],
      developmentStatus: VALID_STATUSES.includes(suggestion.developmentStatus)
        ? suggestion.developmentStatus
        : 'stable',
      softwareType: VALID_SOFTWARE_TYPES.includes(suggestion.softwareType)
        ? suggestion.softwareType
        : 'standalone/other',
      description: suggestion.description || {},
      legal: {
        license: suggestion.legal?.license || repoData.license?.spdx_id || '',
        repoOwner: suggestion.legal?.repoOwner || repoData.owner.login,
        mainCopyrightOwner: suggestion.legal?.mainCopyrightOwner || '',
      },
      maintenance: {
        type: VALID_MAINTENANCE_TYPES.includes(suggestion.maintenance?.type)
          ? suggestion.maintenance.type
          : 'community',
        contacts: Array.isArray(suggestion.maintenance?.contacts)
          ? suggestion.maintenance.contacts
              // Filter out contacts without a real name (not empty string)
              .filter((c: { name?: string; email?: string }) =>
                c.name && typeof c.name === 'string' && c.name.trim().length > 0
              )
              .map((c: { name: string; email?: string; phone?: string; affiliation?: string }) => {
                const contact: { name: string; email?: string; phone?: string; affiliation?: string } = {
                  name: c.name.trim(),
                };
                // Only include email if it looks like a valid email (has @, has domain, no spaces)
                if (c.email && typeof c.email === 'string' &&
                    c.email.trim().length > 0 &&
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())) {
                  contact.email = c.email.trim();
                }
                // Only include phone if it looks like a phone number
                if (c.phone && typeof c.phone === 'string' &&
                    c.phone.trim().length > 0 &&
                    /^[+\d\s()-]+$/.test(c.phone.trim())) {
                  contact.phone = c.phone.trim();
                }
                if (c.affiliation && typeof c.affiliation === 'string' && c.affiliation.trim().length > 0) {
                  contact.affiliation = c.affiliation.trim();
                }
                return contact;
              })
          : [],
      },
      localisation: {
        localisationReady: suggestion.localisation?.localisationReady ?? false,
        availableLanguages: Array.isArray(suggestion.localisation?.availableLanguages)
          ? suggestion.localisation.availableLanguages
          : ['en'],
      },
      intendedAudience: suggestion.intendedAudience || {},
    };

    // Add metadata about the analysis
    const metadata = {
      analyzedAt: new Date().toISOString(),
      sourceRepo: repoData.full_name,
      hadReadme: !!readme,
      hadRelease: !!latestRelease,
      repoStats: {
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        language: repoData.language,
      },
    };

    return NextResponse.json({
      success: true,
      suggestion: cleaned,
      metadata,
    });

  } catch (error) {
    console.error('AI analyze repo error:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid AI-analys av repot' },
      { status: 500 }
    );
  }
}
