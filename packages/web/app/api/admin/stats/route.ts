import { NextResponse } from 'next/server';
import { getDb, COLLECTIONS } from '@/lib/firebase';
import { requireAdmin, handleAuthError } from '@/lib/rbac';

// GET /api/admin/stats - Get platform statistics (admin only)
export async function GET(): Promise<NextResponse> {
  try {
    await requireAdmin();

    const db = getDb();

    // Get organizations stats
    const orgsSnapshot = await db.collection(COLLECTIONS.ORGANIZATIONS).get();
    const organizations = orgsSnapshot.docs.map((doc) => doc.data());
    const orgStats = {
      total: organizations.length,
      verified: organizations.filter((o) => o.verified).length,
      pending: organizations.filter((o) => !o.verified).length,
    };

    // Get users stats
    const usersSnapshot = await db.collection(COLLECTIONS.USERS).get();
    const users = usersSnapshot.docs.map((doc) => doc.data());
    const userStats = {
      total: users.length,
      admins: users.filter((u) => u.roles?.includes('platform_admin')).length,
    };

    // Get repos stats
    const reposSnapshot = await db.collection(COLLECTIONS.REPOSITORIES).get();
    const repoStats = {
      total: reposSnapshot.size,
    };

    return NextResponse.json({
      success: true,
      stats: {
        organizations: orgStats,
        users: userStats,
        repos: repoStats,
      },
    });
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse.status !== 500) {
      return authResponse;
    }
    console.error('Admin stats GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
