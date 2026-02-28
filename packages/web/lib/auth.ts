import { NextAuthOptions, getServerSession } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      login?: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    id?: string;
    login?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID ?? '',
      clientSecret: process.env.GITHUB_SECRET ?? '',
      authorization: {
        params: {
          // Request access to read user's organizations
          scope: 'read:user read:org',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and user info to the token
      if (account && profile) {
        token.accessToken = account.access_token;
        // GitHub profile has 'id' and 'login' fields
        const githubProfile = profile as { id?: number; login?: string };
        token.id = githubProfile.id?.toString();
        token.login = githubProfile.login;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken;
      if (session.user) {
        session.user.id = token.id ?? '';
        session.user.login = token.login;
      }
      return session;
    },
  },
  pages: {
    signIn: '/register',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export function getSession() {
  return getServerSession(authOptions);
}

// Helper to fetch user's GitHub organizations
export interface GitHubOrg {
  id: number;
  login: string;
  avatar_url: string;
  description: string | null;
}

export async function fetchUserOrganizations(accessToken: string): Promise<GitHubOrg[]> {
  const response = await fetch('https://api.github.com/user/orgs', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch organizations');
  }

  return response.json();
}

// Check if user is admin/owner of an organization
export async function isOrgAdmin(accessToken: string, orgLogin: string): Promise<boolean> {
  const response = await fetch(`https://api.github.com/user/memberships/orgs/${orgLogin}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    return false;
  }

  const membership = await response.json();
  return membership.role === 'admin';
}
