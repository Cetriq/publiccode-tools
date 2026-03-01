// Firebase Admin SDK - Server-side only
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { createHash } from 'crypto';

let app: App | undefined;
let db: Firestore | undefined;

// Helper to properly format private key from environment variable
function formatPrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;
  // Handle both escaped newlines (\n as literal characters) and actual newlines
  // Also handle JSON-escaped keys that might have extra backslashes
  return key
    .replace(/\\\\n/g, '\n')  // Handle double-escaped \\n
    .replace(/\\n/g, '\n');   // Handle single-escaped \n
}

function getFirebaseAdmin(): { app: App; db: Firestore } {
  if (!app) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error(
        'Missing Firebase Admin credentials. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY.'
      );
    }

    const existingApps = getApps();
    if (existingApps.length > 0) {
      app = existingApps[0];
    } else {
      app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    }
  }

  if (!db) {
    db = getFirestore(app);
  }

  return { app, db };
}

// Collection names
export const COLLECTIONS = {
  REPOSITORIES: 'repositories',
  REGISTRY_TOKENS: 'registry_tokens',
  ORGANIZATIONS: 'organizations',
  COMMENTS: 'comments',
  USERS: 'users',
} as const;

// Hash a URL to create a document ID
export function hashUrl(url: string): string {
  return createHash('sha256').update(url.toLowerCase().trim()).digest('hex');
}

// Hash an API token for storage
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

// Validate API token against stored hashes
export async function validateApiToken(token: string): Promise<boolean> {
  try {
    const { db } = getFirebaseAdmin();
    const hashedToken = hashToken(token);

    const tokenDoc = await db
      .collection(COLLECTIONS.REGISTRY_TOKENS)
      .where('token', '==', hashedToken)
      .where('enabled', '==', true)
      .limit(1)
      .get();

    return !tokenDoc.empty;
  } catch (error) {
    console.error('Error validating API token:', error);
    return false;
  }
}

// Get Firestore instance
export function getDb(): Firestore {
  const { db } = getFirebaseAdmin();
  return db;
}

export { getFirebaseAdmin };
