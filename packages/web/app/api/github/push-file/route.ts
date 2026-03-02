import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface PushFileRequest {
  repoUrl: string;
  content: string;
  branch?: string;
  commitMessage?: string;
}

// Parse GitHub URL to get owner and repo
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const patterns = [
    /github\.com\/([^/]+)\/([^/]+)/,
    /github\.com:([^/]+)\/([^/]+)/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ''),
      };
    }
  }

  return null;
}

// Verify user has write access to the repo
async function verifyWriteAccess(
  accessToken: string,
  owner: string,
  repo: string
): Promise<{ hasAccess: boolean; reason?: string }> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      return { hasAccess: false, reason: 'Kunde inte hitta repot' };
    }

    const repoData = await response.json();

    // Check if user has push permission
    if (repoData.permissions?.push) {
      return { hasAccess: true };
    }

    return { hasAccess: false, reason: 'Du har inte skrivrättigheter till detta repo' };
  } catch (error) {
    console.error('Error verifying write access:', error);
    return { hasAccess: false, reason: 'Kunde inte verifiera åtkomst' };
  }
}

// Get the default branch of the repo
async function getDefaultBranch(
  accessToken: string,
  owner: string,
  repo: string
): Promise<string> {
  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github.v3+json',
      },
    }
  );

  if (response.ok) {
    const data = await response.json();
    return data.default_branch || 'main';
  }

  return 'main';
}

// Get existing file SHA (needed for updates)
async function getFileSha(
  accessToken: string,
  owner: string,
  repo: string,
  path: string,
  branch: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (response.ok) {
      const data = await response.json();
      return data.sha;
    }

    return null;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session?.accessToken) {
      return NextResponse.json(
        { error: 'Du måste vara inloggad med GitHub för att pusha filer.' },
        { status: 401 }
      );
    }

    const accessToken = session.accessToken as string;

    // Parse request body
    const body: PushFileRequest = await request.json();
    const { repoUrl, content, branch: requestedBranch, commitMessage } = body;

    if (!repoUrl || !content) {
      return NextResponse.json(
        { error: 'Repo-URL och innehåll krävs' },
        { status: 400 }
      );
    }

    // Parse GitHub URL
    const parsed = parseGitHubUrl(repoUrl);
    if (!parsed) {
      return NextResponse.json(
        { error: 'Ogiltig GitHub-URL' },
        { status: 400 }
      );
    }

    const { owner, repo } = parsed;

    // Verify write access
    const accessCheck = await verifyWriteAccess(accessToken, owner, repo);
    if (!accessCheck.hasAccess) {
      return NextResponse.json(
        { error: accessCheck.reason || 'Ingen åtkomst till repot' },
        { status: 403 }
      );
    }

    // Get the branch to use
    const branch = requestedBranch || await getDefaultBranch(accessToken, owner, repo);

    // Check if file already exists (to get SHA for update)
    const existingSha = await getFileSha(accessToken, owner, repo, 'publiccode.yml', branch);

    // Create or update the file
    const createFileBody: Record<string, string> = {
      message: commitMessage || (existingSha
        ? 'Uppdatera publiccode.yml via SamhällsKodex'
        : 'Lägg till publiccode.yml via SamhällsKodex'),
      content: Buffer.from(content).toString('base64'),
      branch,
    };

    if (existingSha) {
      createFileBody.sha = existingSha;
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/publiccode.yml`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createFileBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('GitHub API error:', errorData);
      return NextResponse.json(
        { error: `Kunde inte pusha till GitHub: ${errorData.message || 'Okänt fel'}` },
        { status: response.status }
      );
    }

    const result = await response.json();

    return NextResponse.json({
      success: true,
      message: existingSha ? 'publiccode.yml uppdaterad!' : 'publiccode.yml skapad!',
      commitUrl: result.commit?.html_url,
      fileUrl: result.content?.html_url,
      branch,
    });

  } catch (error) {
    console.error('Push file error:', error);
    return NextResponse.json(
      { error: 'Ett oväntat fel inträffade' },
      { status: 500 }
    );
  }
}
