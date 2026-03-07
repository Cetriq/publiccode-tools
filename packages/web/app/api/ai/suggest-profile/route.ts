import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Anthropic from '@anthropic-ai/sdk';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Valid profile values from x-samhallskodex schema
const VALID_UI_PLATFORMS = ['web', 'desktop', 'mobile', 'cli', 'api', 'embedded', 'none', 'other'];
const VALID_BACKEND_ARCHITECTURES = ['container', 'vm', 'serverless', 'native', 'mixed'];
const VALID_HOSTING = ['public-cloud', 'private-cloud', 'on-premise', 'hybrid'];
const VALID_API_STYLES = ['rest', 'graphql', 'grpc', 'soap', 'odata', 'websocket', 'none'];
const VALID_IDENTITY = ['oidc', 'oauth2', 'saml', 'ldap', 'ad', 'bankid', 'freja', 'eidas', 'siths', 'basic-auth', 'api-key', 'jwt', 'none', 'other'];
const VALID_AI_USE_CASES = ['assistant', 'chatbot', 'summarization', 'classification', 'extraction', 'translation', 'transcription', 'recommendation', 'decision-support', 'anomaly-detection', 'forecasting', 'image-recognition', 'document-processing', 'code-generation', 'search', 'other'];
const VALID_OPENNESS_LEVELS = ['open-source', 'open-core', 'source-available', 'proprietary'];
const VALID_DATA_LOCALITY = ['municipality', 'sweden', 'eu', 'non-eu', 'hybrid', 'unknown'];
const VALID_VENDOR_DEPENDENCY = ['none', 'low', 'medium', 'high'];

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
        return content.slice(0, 10000);
      }
    } catch {
      continue;
    }
  }
  return null;
}

async function fetchPackageJson(owner: string, repo: string): Promise<Record<string, unknown> | null> {
  try {
    const response = await fetch(
      `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/package.json`,
      { headers: { 'User-Agent': 'publiccode-tools' } }
    );
    if (response.ok) {
      return await response.json();
    }
  } catch {
    return null;
  }
  return null;
}

async function fetchDockerfile(owner: string, repo: string): Promise<string | null> {
  const dockerFiles = ['Dockerfile', 'dockerfile', 'docker/Dockerfile'];

  for (const filename of dockerFiles) {
    try {
      const response = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${filename}`,
        { headers: { 'User-Agent': 'publiccode-tools' } }
      );
      if (response.ok) {
        const content = await response.text();
        return content.slice(0, 3000);
      }
    } catch {
      continue;
    }
  }
  return null;
}

async function fetchRepoData(owner: string, repo: string): Promise<{
  description: string | null;
  language: string | null;
  topics: string[];
  license: string | null;
} | null> {
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
      const data = await response.json();
      return {
        description: data.description,
        language: data.language,
        topics: data.topics || [],
        license: data.license?.spdx_id || null,
      };
    }
  } catch {
    return null;
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Du måste vara inloggad för att använda AI-analys.' },
        { status: 401 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'AI-tjänsten är inte konfigurerad. Kontakta administratören.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'GitHub-URL krävs' },
        { status: 400 }
      );
    }

    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Ogiltig GitHub-URL' },
        { status: 400 }
      );
    }

    // Fetch repo data in parallel
    const [readme, packageJson, dockerfile, repoData] = await Promise.all([
      fetchReadme(parsed.owner, parsed.repo),
      fetchPackageJson(parsed.owner, parsed.repo),
      fetchDockerfile(parsed.owner, parsed.repo),
      fetchRepoData(parsed.owner, parsed.repo),
    ]);

    if (!readme && !repoData?.description) {
      return NextResponse.json(
        { error: 'Kunde inte hitta README eller beskrivning för detta projekt.' },
        { status: 404 }
      );
    }

    // Build context for Claude
    let context = `# Repository Analysis for Technical Profile\n\n`;
    context += `## Basic Info\n`;
    context += `- Name: ${parsed.repo}\n`;
    context += `- Owner: ${parsed.owner}\n`;
    if (repoData?.description) context += `- Description: ${repoData.description}\n`;
    if (repoData?.language) context += `- Primary Language: ${repoData.language}\n`;
    if (repoData?.topics?.length) context += `- Topics: ${repoData.topics.join(', ')}\n`;
    if (repoData?.license) context += `- License: ${repoData.license}\n`;

    if (packageJson) {
      context += `\n## package.json\n`;
      context += `- Name: ${packageJson.name || 'N/A'}\n`;
      if (packageJson.dependencies) {
        context += `- Dependencies: ${Object.keys(packageJson.dependencies as Record<string, string>).slice(0, 30).join(', ')}\n`;
      }
      if (packageJson.devDependencies) {
        context += `- Dev Dependencies: ${Object.keys(packageJson.devDependencies as Record<string, string>).slice(0, 20).join(', ')}\n`;
      }
    }

    if (dockerfile) {
      context += `\n## Dockerfile\n\`\`\`\n${dockerfile}\n\`\`\`\n`;
    }

    if (readme) {
      context += `\n## README\n${readme}\n`;
    }

    // Call Claude API
    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `Du är en expert på att analysera mjukvaruprojekt och klassificera deras tekniska arkitektur.

Analysera följande GitHub-repository och föreslå värden för x-samhallskodex profilen.

${context}

Generera ett JSON-objekt med teknisk profil. Fyll ENDAST i fält du är säker på baserat på informationen ovan. Utelämna fält du inte kan avgöra.

{
  "architecture": {
    "ui": {
      "platform": "EN AV: ${VALID_UI_PLATFORMS.join(', ')}",
      "framework": "namn på UI-framework (React, Vue, Angular, Flutter, etc) - utelämna om okänt"
    },
    "backend": {
      "architecture": "EN AV: ${VALID_BACKEND_ARCHITECTURES.join(', ')}",
      "runtime": "runtime (Node.js, Python, Java, .NET, Go, etc) - utelämna om okänt"
    },
    "deployment": {
      "hosting": "EN AV: ${VALID_HOSTING.join(', ')} - utelämna om okänt"
    }
  },
  "integration": {
    "apiStyles": ["ARRAY AV: ${VALID_API_STYLES.join(', ')}"],
    "identity": ["ARRAY AV: ${VALID_IDENTITY.join(', ')} - inkludera bara om det finns tydliga tecken"]
  },
  "ai": {
    "enabled": true/false,
    "useCases": ["ARRAY AV: ${VALID_AI_USE_CASES.join(', ')} - bara om ai.enabled=true"],
    "humanInLoop": true/false (om AI används, behövs mänsklig översyn?)
  },
  "governance": {
    "opennessLevel": "EN AV: ${VALID_OPENNESS_LEVELS.join(', ')}",
    "dataHosting": {
      "locality": "EN AV: ${VALID_DATA_LOCALITY.join(', ')} - utelämna om okänt"
    },
    "vendorDependency": "EN AV: ${VALID_VENDOR_DEPENDENCY.join(', ')} - bedöm baserat på beroenden"
  }
}

VIKTIGT:
- Basera svaret ENDAST på konkret information i repot
- Om du är osäker på ett fält, UTELÄMNA det
- AI.enabled ska vara true ENDAST om projektet faktiskt använder AI/ML
- För apiStyles, leta efter REST-routes, GraphQL-schemas, gRPC-protos, etc.
- För identity, leta efter OAuth, SAML, BankID-integrationer, etc.
- vendorDependency: "none" om inga proprietära tjänster, "low" om få, "medium" om flera, "high" om kritiskt beroende
- opennessLevel: basera på licensen (MIT/Apache/GPL = open-source, etc)

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
    const cleaned: Record<string, unknown> = {
      profileVersion: '0.1',
    };

    // Architecture
    if (suggestion.architecture) {
      const arch: Record<string, unknown> = {};

      if (suggestion.architecture.ui) {
        const ui: Record<string, string> = {};
        if (VALID_UI_PLATFORMS.includes(suggestion.architecture.ui.platform)) {
          ui.platform = suggestion.architecture.ui.platform;
        }
        if (suggestion.architecture.ui.framework) {
          ui.framework = suggestion.architecture.ui.framework;
        }
        if (Object.keys(ui).length > 0) arch.ui = ui;
      }

      if (suggestion.architecture.backend) {
        const backend: Record<string, string> = {};
        if (VALID_BACKEND_ARCHITECTURES.includes(suggestion.architecture.backend.architecture)) {
          backend.architecture = suggestion.architecture.backend.architecture;
        }
        if (suggestion.architecture.backend.runtime) {
          backend.runtime = suggestion.architecture.backend.runtime;
        }
        if (Object.keys(backend).length > 0) arch.backend = backend;
      }

      if (suggestion.architecture.deployment) {
        const deployment: Record<string, string> = {};
        if (VALID_HOSTING.includes(suggestion.architecture.deployment.hosting)) {
          deployment.hosting = suggestion.architecture.deployment.hosting;
        }
        if (Object.keys(deployment).length > 0) arch.deployment = deployment;
      }

      if (Object.keys(arch).length > 0) cleaned.architecture = arch;
    }

    // Integration
    if (suggestion.integration) {
      const integration: Record<string, string[]> = {};

      if (Array.isArray(suggestion.integration.apiStyles)) {
        const validStyles = suggestion.integration.apiStyles.filter((s: string) => VALID_API_STYLES.includes(s));
        if (validStyles.length > 0) integration.apiStyles = validStyles;
      }

      if (Array.isArray(suggestion.integration.identity)) {
        const validIdentity = suggestion.integration.identity.filter((s: string) => VALID_IDENTITY.includes(s));
        if (validIdentity.length > 0) integration.identity = validIdentity;
      }

      if (Object.keys(integration).length > 0) cleaned.integration = integration;
    }

    // AI
    if (suggestion.ai !== undefined) {
      const ai: Record<string, unknown> = {
        enabled: !!suggestion.ai.enabled,
      };

      if (suggestion.ai.enabled && Array.isArray(suggestion.ai.useCases)) {
        const validUseCases = suggestion.ai.useCases.filter((s: string) => VALID_AI_USE_CASES.includes(s));
        if (validUseCases.length > 0) ai.useCases = validUseCases;
      }

      if (suggestion.ai.enabled && typeof suggestion.ai.humanInLoop === 'boolean') {
        ai.humanInLoop = suggestion.ai.humanInLoop;
      }

      cleaned.ai = ai;
    }

    // Governance
    if (suggestion.governance) {
      const governance: Record<string, unknown> = {};

      if (VALID_OPENNESS_LEVELS.includes(suggestion.governance.opennessLevel)) {
        governance.opennessLevel = suggestion.governance.opennessLevel;
      }

      if (suggestion.governance.dataHosting?.locality && VALID_DATA_LOCALITY.includes(suggestion.governance.dataHosting.locality)) {
        governance.dataHosting = { locality: suggestion.governance.dataHosting.locality };
      }

      if (VALID_VENDOR_DEPENDENCY.includes(suggestion.governance.vendorDependency)) {
        governance.vendorDependency = suggestion.governance.vendorDependency;
      }

      if (Object.keys(governance).length > 0) cleaned.governance = governance;
    }

    return NextResponse.json({
      success: true,
      profile: cleaned,
      metadata: {
        analyzedAt: new Date().toISOString(),
        sourceRepo: `${parsed.owner}/${parsed.repo}`,
        hadReadme: !!readme,
        hadPackageJson: !!packageJson,
        hadDockerfile: !!dockerfile,
        language: repoData?.language,
      },
    });

  } catch (error) {
    console.error('AI suggest profile error:', error);
    return NextResponse.json(
      { error: 'Ett fel uppstod vid AI-analys av profilen' },
      { status: 500 }
    );
  }
}
