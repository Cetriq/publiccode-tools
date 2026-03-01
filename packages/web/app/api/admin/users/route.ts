import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS } from '@/lib/firebase';
import { requireAdmin, handleAuthError } from '@/lib/rbac';
import { FieldValue } from 'firebase-admin/firestore';

// Force dynamic rendering - prevents build-time Firebase initialization
export const dynamic = 'force-dynamic';

// GET /api/admin/users - List all users (admin only)
export async function GET(): Promise<NextResponse> {
  try {
    await requireAdmin();

    const db = getDb();
    const snapshot = await db
      .collection(COLLECTIONS.USERS)
      .orderBy('createdAt', 'desc')
      .get();

    const users = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        login: data.login,
        name: data.name,
        email: data.email,
        avatarUrl: data.avatarUrl,
        roles: data.roles || ['user'],
        verified: data.verified || false,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        lastLogin: data.lastLogin?.toDate?.()?.toISOString() || null,
      };
    });

    return NextResponse.json({
      success: true,
      users,
    });
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse.status !== 500) {
      return authResponse;
    }
    console.error('Admin users GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/admin/users - Verify/unverify a user
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await requireAdmin();

    const body = await request.json();
    const { userId, verified } = body;

    if (!userId || typeof verified !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'Missing userId or verified status' },
        { status: 400 }
      );
    }

    const db = getDb();
    const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    await userRef.update({
      verified,
      verifiedAt: verified ? FieldValue.serverTimestamp() : null,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: verified ? 'Användare verifierad' : 'Verifiering borttagen',
      verified,
    });
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse.status !== 500) {
      return authResponse;
    }
    console.error('Admin users POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users - Update user roles
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    await requireAdmin();

    const body = await request.json();
    const { userId, action, role } = body;

    if (!userId || !action || !role) {
      return NextResponse.json(
        { success: false, message: 'Missing userId, action, or role' },
        { status: 400 }
      );
    }

    if (!['add', 'remove'].includes(action)) {
      return NextResponse.json(
        { success: false, message: 'Action must be "add" or "remove"' },
        { status: 400 }
      );
    }

    if (!['platform_admin', 'user'].includes(role)) {
      return NextResponse.json(
        { success: false, message: 'Invalid role' },
        { status: 400 }
      );
    }

    const db = getDb();
    const userRef = db.collection(COLLECTIONS.USERS).doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userDoc.data();
    let currentRoles: string[] = userData?.roles || ['user'];

    if (action === 'add') {
      if (!currentRoles.includes(role)) {
        currentRoles = [...currentRoles, role];
      }
    } else {
      // Don't allow removing the last admin
      if (role === 'platform_admin') {
        const adminsSnapshot = await db
          .collection(COLLECTIONS.USERS)
          .where('roles', 'array-contains', 'platform_admin')
          .get();

        if (adminsSnapshot.size <= 1 && currentRoles.includes('platform_admin')) {
          return NextResponse.json(
            { success: false, message: 'Kan inte ta bort den sista administratören' },
            { status: 400 }
          );
        }
      }
      currentRoles = currentRoles.filter((r) => r !== role);
    }

    // Ensure user always has at least 'user' role
    if (!currentRoles.includes('user')) {
      currentRoles.push('user');
    }

    await userRef.update({
      roles: currentRoles,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: action === 'add' ? 'Roll tillagd' : 'Roll borttagen',
      roles: currentRoles,
    });
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse.status !== 500) {
      return authResponse;
    }
    console.error('Admin users PATCH error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
