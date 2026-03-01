import { NextRequest, NextResponse } from 'next/server';
import { parse as parseYaml } from 'yaml';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface GitHubRepo {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  license: {
    spdx_id: string;
    name: string;
  } | null;
  owner: {
    login: string;
    type: string;
  };
  topics: string[];
  language: string | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  default_branch: string;
}

interface ImportResult {
  name: string;
  url: string;
  description: string;
  license: string;
  repoOwner: string;
  topics: string[];
  language: string | null;
  releaseDate: string;
  publiccodeYml?: Record<string, unknown>;
  hasPubliccodeYml: boolean;
}

// Map common SPDX license IDs to publiccode format
const licenseMap: Record<string, string> = {
  'MIT': 'MIT',
  'Apache-2.0': 'Apache-2.0',
  'GPL-3.0': 'GPL-3.0-only',
  'GPL-3.0-only': 'GPL-3.0-only',
  'GPL-2.0': 'GPL-2.0-only',
  'GPL-2.0-only': 'GPL-2.0-only',
  'LGPL-3.0': 'LGPL-3.0-only',
  'LGPL-3.0-only': 'LGPL-3.0-only',
  'BSD-3-Clause': 'BSD-3-Clause',
  'BSD-2-Clause': 'BSD-2-Clause',
  'MPL-2.0': 'MPL-2.0',
  'AGPL-3.0': 'AGPL-3.0-only',
  'AGPL-3.0-only': 'AGPL-3.0-only',
  'EUPL-1.2': 'EUPL-1.2',
  'CC0-1.0': 'CC0-1.0',
  'Unlicense': 'Unlicense',
  'ISC': 'ISC',
};

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  // Handle formats:
  // - https://github.com/owner/repo
  // - https://github.com/owner/repo.git
  // - github.com/owner/repo
  // - owner/repo

  const cleaned = url.trim().replace(/\.git$/, '');

  // Try full URL
  const urlMatch = cleaned.match(/(?:https?:\/\/)?github\.com\/([^/]+)\/([^/]+)/);
  if (urlMatch) {
    return { owner: urlMatch[1], repo: urlMatch[2] };
  }

  // Try owner/repo format
  const simpleMatch = cleaned.match(/^([^/]+)\/([^/]+)$/);
  if (simpleMatch) {
    return { owner: simpleMatch[1], repo: simpleMatch[2] };
  }

  return null;
}

async function fetchPubliccodeYml(owner: string, repo: string): Promise<Record<string, unknown> | null> {
  // Try different locations and file names
  const paths = [
    'publiccode.yml',
    'publiccode.yaml',
    '.publiccode.yml',
    '.publiccode.yaml',
  ];

  for (const path of paths) {
    try {
      const response = await fetch(
        `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${path}`,
        { headers: { 'User-Agent': 'publiccode-tools' } }
      );
      if (response.ok) {
        const content = await response.text();
        const parsed = parseYaml(content);
        return parsed as Record<string, unknown>;
      }
    } catch {
      continue;
    }
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL krävs' },
        { status: 400 }
      );
    }

    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Ogiltig GitHub-URL. Ange en URL som https://github.com/owner/repo eller owner/repo' },
        { status: 400 }
      );
    }

    const { owner, repo } = parsed;

    // Fetch repo data from GitHub API
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'publiccode-tools',
      },
    });

    if (response.status === 404) {
      return NextResponse.json(
        { error: `Hittade inte kodarkiv: ${owner}/${repo}. Kontrollera att det är publikt och att URL:en är korrekt.` },
        { status: 404 }
      );
    }

    if (response.status === 403) {
      return NextResponse.json(
        { error: 'GitHub API rate limit nådd. Vänta en stund och försök igen.' },
        { status: 429 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `Kunde inte hämta data från GitHub: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data: GitHubRepo = await response.json();

    // Try to fetch existing publiccode.yml
    const publiccodeYml = await fetchPubliccodeYml(owner, repo);

    // Map to publiccode format
    const result: ImportResult = {
      name: data.name,
      url: data.html_url,
      description: data.description || '',
      license: data.license?.spdx_id ? (licenseMap[data.license.spdx_id] || data.license.spdx_id) : '',
      repoOwner: data.owner.type === 'Organization' ? data.owner.login : '',
      topics: data.topics || [],
      language: data.language,
      releaseDate: data.pushed_at ? data.pushed_at.split('T')[0] : new Date().toISOString().split('T')[0],
      publiccodeYml: publiccodeYml || undefined,
      hasPubliccodeYml: !!publiccodeYml,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('GitHub import error:', error);
    return NextResponse.json(
      { error: 'Ett oväntat fel uppstod vid hämtning av data' },
      { status: 500 }
    );
  }
}
