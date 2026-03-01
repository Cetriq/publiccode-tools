import { getServerSession, Session } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from './auth';
import { getDb, COLLECTIONS } from './firebase';
import { User, UserRole, Permission, hasPermission, isPlatformAdmin } from '@/types/rbac';
import { FieldValue } from 'firebase-admin/firestore';

// Custom error class for authorization errors
export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// Get or create user in Firestore
export async function getOrCreateUser(session: Session): Promise<User> {
  const db = getDb();
  const userRef = db.collection(COLLECTIONS.USERS).doc(session.user.id);
  const userDoc = await userRef.get();

  if (userDoc.exists) {
    // Update last login
    await userRef.update({
      lastLogin: FieldValue.serverTimestamp(),
    });
    return userDoc.data() as User;
  }

  // Create new user with default 'user' role
  const newUser: Omit<User, 'createdAt' | 'lastLogin'> & { createdAt: FieldValue; lastLogin: FieldValue } = {
    id: session.user.id,
    login: session.user.login || session.user.name || 'unknown',
    email: session.user.email || undefined,
    name: session.user.name || undefined,
    avatarUrl: session.user.image || undefined,
    roles: ['user'],
    createdAt: FieldValue.serverTimestamp(),
    lastLogin: FieldValue.serverTimestamp(),
  };

  await userRef.set(newUser);

  // Fetch the created document to get proper timestamps
  const createdDoc = await userRef.get();
  return createdDoc.data() as User;
}

// Get user from Firestore
export async function getUser(userId: string): Promise<User | null> {
  const db = getDb();
  const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();

  if (!userDoc.exists) {
    return null;
  }

  return userDoc.data() as User;
}

// Get current session and ensure user exists
export async function requireAuth(): Promise<{ session: Session; user: User }> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new AuthError('Unauthorized - please log in', 401);
  }

  const user = await getOrCreateUser(session);
  return { session, user };
}

// Require specific permission
export async function requirePermission(permission: Permission): Promise<{ session: Session; user: User }> {
  const { session, user } = await requireAuth();

  if (!hasPermission(user.roles, permission)) {
    throw new AuthError('Forbidden - insufficient permissions', 403);
  }

  return { session, user };
}

// Require platform admin role
export async function requireAdmin(): Promise<{ session: Session; user: User }> {
  const { session, user } = await requireAuth();

  if (!isPlatformAdmin(user.roles)) {
    throw new AuthError('Forbidden - admin access required', 403);
  }

  return { session, user };
}

// Check if user is verified (either has verified flag OR is platform admin)
export function isVerifiedUser(user: User): boolean {
  return user.verified === true || isPlatformAdmin(user.roles);
}

// Require verified user (verified OR admin)
export async function requireVerified(): Promise<{ session: Session; user: User }> {
  const { session, user } = await requireAuth();

  if (!isVerifiedUser(user)) {
    throw new AuthError('Ditt konto måste verifieras av en administratör innan du kan registrera projekt.', 403);
  }

  return { session, user };
}

// Handle auth errors and return appropriate response
export function handleAuthError(error: unknown): NextResponse {
  if (error instanceof AuthError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  console.error('Unexpected error in auth:', error);
  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

// Wrapper for API routes that require authentication
export function withAuth<T>(
  handler: (params: { session: Session; user: User }) => Promise<T>
) {
  return async (): Promise<T | NextResponse> => {
    try {
      const authResult = await requireAuth();
      return await handler(authResult);
    } catch (error) {
      return handleAuthError(error);
    }
  };
}

// Wrapper for API routes that require specific permission
export function withPermission<T>(
  permission: Permission,
  handler: (params: { session: Session; user: User }) => Promise<T>
) {
  return async (): Promise<T | NextResponse> => {
    try {
      const authResult = await requirePermission(permission);
      return await handler(authResult);
    } catch (error) {
      return handleAuthError(error);
    }
  };
}

// Wrapper for API routes that require admin
export function withAdmin<T>(
  handler: (params: { session: Session; user: User }) => Promise<T>
) {
  return async (): Promise<T | NextResponse> => {
    try {
      const authResult = await requireAdmin();
      return await handler(authResult);
    } catch (error) {
      return handleAuthError(error);
    }
  };
}

// Check if user can edit a specific project (owner or admin)
export async function canEditProject(user: User, projectOwnerId: string): Promise<boolean> {
  // Admin can edit any project
  if (isPlatformAdmin(user.roles)) {
    return true;
  }

  // User can only edit their own projects
  return user.id === projectOwnerId;
}

// Check if user can delete a specific project (owner or admin)
export async function canDeleteProject(user: User, projectOwnerId: string): Promise<boolean> {
  // Admin can delete any project
  if (isPlatformAdmin(user.roles)) {
    return true;
  }

  // User can only delete their own projects
  return user.id === projectOwnerId;
}

// Check if user can moderate content (admin only)
export function canModerate(user: User): boolean {
  return isPlatformAdmin(user.roles);
}

// Update user roles (admin only operation)
export async function updateUserRoles(userId: string, roles: UserRole[]): Promise<void> {
  const db = getDb();
  await db.collection(COLLECTIONS.USERS).doc(userId).update({
    roles,
  });
}

// Get all platform admins
export async function getPlatformAdmins(): Promise<User[]> {
  const db = getDb();
  const snapshot = await db
    .collection(COLLECTIONS.USERS)
    .where('roles', 'array-contains', 'platform_admin')
    .get();

  return snapshot.docs.map(doc => doc.data() as User);
}
