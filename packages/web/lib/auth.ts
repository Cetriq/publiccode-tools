import { NextAuthOptions, getServerSession } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import EmailProvider from 'next-auth/providers/email';
import { FirestoreAdapter } from '@auth/firebase-adapter';
import { cert } from 'firebase-admin/app';
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

// Helper to properly format private key from environment variable
function formatPrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  // Handle both escaped newlines (\n as literal characters) and actual newlines
  // Also handle JSON-escaped keys that might have extra backslashes
  // Trim each line to remove any leading/trailing whitespace
  return key
    .replace(/\\\\n/g, '\n')  // Handle double-escaped \\n
    .replace(/\\n/g, '\n')    // Handle single-escaped \n
    .split('\n')
    .map(line => line.trim())
    .join('\n');
}

// Firebase Admin credentials for NextAuth adapter - lazy initialization
function getFirebaseAdminConfig() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

  if (!projectId || !clientEmail || !privateKey) {
    console.warn('Missing Firebase Admin credentials - adapter will be disabled');
    return null;
  }

  return {
    credential: cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  };
}

// Create adapter lazily to avoid build-time errors
function getAdapter() {
  try {
    const config = getFirebaseAdminConfig();
    if (!config) {
      // No adapter when credentials are missing - works fine with JWT strategy
      return undefined;
    }
    return FirestoreAdapter(config);
  } catch (error) {
    // Return undefined if Firebase is not configured (build time)
    console.error('Failed to create Firebase adapter:', error);
    return undefined;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: getAdapter(),
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
      from: process.env.EMAIL_FROM || 'SamhällsKodex <kontakt@samhallskodex.se>',
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
    async jwt({ token, account, profile, user, trigger }) {
      // Persist the OAuth access_token and user info to the token
      if (account?.provider === 'github' && profile) {
        token.accessToken = account.access_token;
        // GitHub profile has 'id' and 'login' fields
        const githubProfile = profile as { id?: number; login?: string };
        token.id = githubProfile.id?.toString();
        token.login = githubProfile.login;
        token.authProvider = 'github';
      }

      // For email provider
      if (account?.provider === 'email' && user) {
        token.id = user.id;
        token.authProvider = 'email';
        if (user.email) {
          token.kommun = getKommunFromEmail(user.email) || undefined;
        }
      }

      // Ensure token.id is always set (fallback to user.id if available)
      if (!token.id && user?.id) {
        token.id = user.id;
      }

      // Fetch roles from database on sign in or when updating session
      if (token.id && (trigger === 'signIn' || trigger === 'update' || !token.roles)) {
        try {
          // Dynamic import to avoid initialization errors
          const { getDb, COLLECTIONS } = await import('@/lib/firebase');
          const db = getDb();
          const userDoc = await db.collection(COLLECTIONS.USERS).doc(token.id).get();
          if (userDoc.exists) {
            const userData = userDoc.data();
            token.roles = userData?.roles || ['user'];
          } else {
            token.roles = ['user'];
          }
        } catch (error) {
          console.error('Error fetching user roles:', error);
          token.roles = token.roles || ['user'];
        }
      }

      return token;
    },
    async session({ session, token, user }) {
      // With database adapter, we get user instead of token for database sessions
      // With JWT strategy, we get token
      // Always ensure session.user exists before accessing properties
      if (!session.user) {
        session.user = {
          id: '',
          roles: ['user'],
        };
      }

      if (token) {
        session.accessToken = token.accessToken;
        session.user.id = token.id ?? '';
        session.user.login = token.login;
        session.user.roles = token.roles || ['user'];
        session.user.kommun = token.kommun;
        session.user.authProvider = token.authProvider;
      } else if (user) {
        // Database session - user object from adapter
        session.user.id = user.id;
        session.user.roles = ['user'];
      }
      // If neither token nor user, session.user keeps defaults from above
      return session;
    },
  },
  session: {
    strategy: 'jwt', // Use JWT to preserve access tokens
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
