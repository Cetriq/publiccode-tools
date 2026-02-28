import { NextAuthOptions, getServerSession } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import EmailProvider from 'next-auth/providers/email';
import type { UserRole } from '@/types/rbac';
import { isKommunEmail, getKommunFromEmail } from '@/data/kommun-domains';
import { sendMagicLink } from '@/lib/email';

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
      roles?: UserRole[];
      kommun?: string; // For municipality users
      authProvider?: 'github' | 'email';
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    id?: string;
    login?: string;
    roles?: UserRole[];
    kommun?: string;
    authProvider?: 'github' | 'email';
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
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT) || 465,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM || 'SamhällsKodex <noreply@samhallskodex.se>',
      maxAge: 24 * 60 * 60, // Magic link valid for 24 hours
      async sendVerificationRequest({ identifier: email, url }) {
        // Only allow kommun emails
        if (!isKommunEmail(email)) {
          throw new Error('Endast kommunala e-postadresser (@kommun.se) är tillåtna');
        }

        const kommun = getKommunFromEmail(email);
        await sendMagicLink({ email, url, kommun: kommun || undefined });
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For email provider, validate kommun domain
      if (account?.provider === 'email') {
        if (!user.email || !isKommunEmail(user.email)) {
          return false;
        }
      }
      return true;
    },
    async jwt({ token, account, profile, user }) {
      // Persist the OAuth access_token and user info to the token
      if (account && profile) {
        token.accessToken = account.access_token;
        // GitHub profile has 'id' and 'login' fields
        const githubProfile = profile as { id?: number; login?: string };
        token.id = githubProfile.id?.toString();
        token.login = githubProfile.login;
        token.authProvider = 'github';
      }

      // For email provider
      if (account?.provider === 'email' && user?.email) {
        token.id = user.id;
        token.authProvider = 'email';
        token.kommun = getKommunFromEmail(user.email) || undefined;
      }

      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken;
      if (session.user) {
        session.user.id = token.id ?? '';
        session.user.login = token.login;
        session.user.roles = token.roles || ['user'];
        session.user.kommun = token.kommun;
        session.user.authProvider = token.authProvider;
      }
      return session;
    },
  },
  pages: {
    signIn: '/register',
    verifyRequest: '/auth/verify-request', // Page shown after magic link is sent
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
