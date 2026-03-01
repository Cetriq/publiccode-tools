import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getFirebaseAdmin, COLLECTIONS } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * POST /api/admin/bootstrap
 *
 * Bootstrap the first platform admin. This works in two scenarios:
 *
 * 1. If ADMIN_GITHUB_IDS env var is set, only those GitHub IDs can become admin
 * 2. If no admins exist yet AND no ADMIN_GITHUB_IDS is set, the first user to
 *    call this endpoint becomes admin (useful for self-hosted instances)
 *
 * This endpoint can only be used once per user and follows the principle of
 * least surprise - it won't silently make someone admin.
 */
export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Du måste vara inloggad' },
        { status: 401 }
      );
    }

    const { db } = getFirebaseAdmin();
    const userId = session.user.id;

    // Check if user already has platform_admin role
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
    const userData = userDoc.data();

    if (userData?.roles?.includes('platform_admin')) {
      return NextResponse.json(
        { success: false, message: 'Du är redan plattformsadministratör' },
        { status: 400 }
      );
    }

    // Check if ADMIN_GITHUB_IDS is configured
    const allowedAdminIds = process.env.ADMIN_GITHUB_IDS?.split(',').map(id => id.trim()) || [];

    if (allowedAdminIds.length > 0) {
      // Restricted mode: only allowed IDs can become admin
      if (!allowedAdminIds.includes(userId)) {
        return NextResponse.json(
          { success: false, message: 'Ditt GitHub-konto är inte auktoriserat som administratör' },
          { status: 403 }
        );
      }
    } else {
      // Open mode: check if any admin exists
      const existingAdmins = await db
        .collection(COLLECTIONS.USERS)
        .where('roles', 'array-contains', 'platform_admin')
        .limit(1)
        .get();

      if (!existingAdmins.empty) {
        return NextResponse.json(
          {
            success: false,
            message: 'En administratör finns redan. Kontakta befintlig admin för att få adminrättigheter.'
          },
          { status: 403 }
        );
      }
    }

    // Grant platform_admin role
    const currentRoles = userData?.roles || ['user'];
    const newRoles = [...new Set([...currentRoles, 'platform_admin'])];

    if (userDoc.exists) {
      await db.collection(COLLECTIONS.USERS).doc(userId).update({
        roles: newRoles,
        updatedAt: FieldValue.serverTimestamp(),
      });
    } else {
      // Create user document if it doesn't exist
      // Build document data, excluding undefined values (Firestore doesn't allow them)
      const newUserData: Record<string, unknown> = {
        id: userId,
        login: session.user.login || session.user.name || 'unknown',
        roles: newRoles,
        createdAt: FieldValue.serverTimestamp(),
        lastLogin: FieldValue.serverTimestamp(),
      };

      // Only add optional fields if they have values
      if (session.user.email) {
        newUserData.email = session.user.email;
      }
      if (session.user.name) {
        newUserData.name = session.user.name;
      }
      if (session.user.image) {
        newUserData.avatarUrl = session.user.image;
      }

      await db.collection(COLLECTIONS.USERS).doc(userId).set(newUserData);
    }

    return NextResponse.json({
      success: true,
      message: 'Du är nu plattformsadministratör!',
      roles: newRoles,
    });
  } catch (error) {
    console.error('Bootstrap admin error:', error);
    return NextResponse.json(
      { success: false, message: 'Ett fel uppstod' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/bootstrap
 *
 * Check if bootstrap is available for current user
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({
        available: false,
        reason: 'not_logged_in',
      });
    }

    const { db } = getFirebaseAdmin();
    const userId = session.user.id;

    // Check if user already is admin
    const userDoc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
    const userData = userDoc.data();

    if (userData?.roles?.includes('platform_admin')) {
      return NextResponse.json({
        available: false,
        reason: 'already_admin',
        isAdmin: true,
      });
    }

    // Check if ADMIN_GITHUB_IDS is configured
    const allowedAdminIds = process.env.ADMIN_GITHUB_IDS?.split(',').map(id => id.trim()) || [];

    if (allowedAdminIds.length > 0) {
      // Restricted mode
      if (allowedAdminIds.includes(userId)) {
        return NextResponse.json({
          available: true,
          reason: 'allowed_by_config',
        });
      } else {
        return NextResponse.json({
          available: false,
          reason: 'not_in_allowed_list',
        });
      }
    } else {
      // Open mode: check if any admin exists
      const existingAdmins = await db
        .collection(COLLECTIONS.USERS)
        .where('roles', 'array-contains', 'platform_admin')
        .limit(1)
        .get();

      if (existingAdmins.empty) {
        return NextResponse.json({
          available: true,
          reason: 'no_admin_exists',
          message: 'Ingen administratör finns ännu. Du kan bli den första!',
        });
      } else {
        return NextResponse.json({
          available: false,
          reason: 'admin_exists',
        });
      }
    }
  } catch (error) {
    console.error('Bootstrap check error:', error);
    return NextResponse.json(
      { available: false, reason: 'error' },
      { status: 500 }
    );
  }
}
