// GitHub API helpers for fetching publiccode.yml from repos

export interface GitHubRepoInfo {
  owner: string;
  repo: string;
  defaultBranch: string;
}

export interface FetchPubliccodeResult {
  success: boolean;
  content?: string;
  error?: string;
  errorCode?: 'not_found' | 'invalid_url' | 'fetch_error' | 'no_access';
}

/**
 * Parse a GitHub URL to extract owner and repo
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  try {
    const parsed = new URL(url);

    if (parsed.hostname !== 'github.com' && parsed.hostname !== 'www.github.com') {
      return null;
    }

    // Remove leading slash and .git suffix
    const path = parsed.pathname.replace(/^\//, '').replace(/\.git$/, '');
    const parts = path.split('/').filter(Boolean);

    if (parts.length < 2) {
      return null;
    }

    return {
      owner: parts[0],
      repo: parts[1],
    };
  } catch {
    return null;
  }
}

/**
 * Get the default branch for a repo using GitHub API
 */
export async function getDefaultBranch(
  owner: string,
  repo: string,
  accessToken?: string
): Promise<string> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'SamhallsKodex',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers,
  });

  if (!response.ok) {
    // Default to 'main' if we can't get the info
    return 'main';
  }

  const data = await response.json();
  return data.default_branch || 'main';
}

/**
 * Check if user has access to a repo using GitHub API
 */
export async function checkRepoAccess(
  owner: string,
  repo: string,
  accessToken: string
): Promise<boolean> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'SamhallsKodex',
    },
  });

  return response.ok;
}

/**
 * Fetch publiccode.yml content from a GitHub repo
 */
export async function fetchPubliccode(
  repoUrl: string,
  accessToken?: string
): Promise<FetchPubliccodeResult> {
  // Parse the URL
  const parsed = parseGitHubUrl(repoUrl);
  if (!parsed) {
    return {
      success: false,
      error: 'Ogiltig GitHub-URL. Ange en URL som https://github.com/owner/repo',
      errorCode: 'invalid_url',
    };
  }

  const { owner, repo } = parsed;

  // If we have an access token, verify access
  if (accessToken) {
    const hasAccess = await checkRepoAccess(owner, repo, accessToken);
    if (!hasAccess) {
      return {
        success: false,
        error: 'Du har inte tillgång till detta repo.',
        errorCode: 'no_access',
      };
    }
  }

  // Get default branch
  const branch = await getDefaultBranch(owner, repo, accessToken);

  // Try to fetch publiccode.yml from raw.githubusercontent.com
  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/publiccode.yml`;

  const headers: Record<string, string> = {
    'User-Agent': 'SamhallsKodex',
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(rawUrl, { headers });

    if (response.status === 404) {
      return {
        success: false,
        error: 'Vi hittade ingen publiccode.yml i repot.',
        errorCode: 'not_found',
      };
    }

    if (!response.ok) {
      return {
        success: false,
        error: `Kunde inte hämta publiccode.yml (status ${response.status})`,
        errorCode: 'fetch_error',
      };
    }

    const content = await response.text();
    return {
      success: true,
      content,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Kunde inte ansluta till GitHub',
      errorCode: 'fetch_error',
    };
  }
}
