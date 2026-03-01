import { NextResponse } from 'next/server';
import { getDb, COLLECTIONS } from '@/lib/firebase';
import { requireAdmin, handleAuthError } from '@/lib/rbac';

// Force dynamic rendering - prevents build-time Firebase initialization
export const dynamic = 'force-dynamic';

// GET /api/admin/debug-repos - Debug: show all repos with registeredBy fields
export async function GET(): Promise<NextResponse> {
  try {
    // Require platform_admin role
    const { session } = await requireAdmin();

    const db = getDb();
    const snapshot = await db.collection(COLLECTIONS.REPOSITORIES).get();

    const repos: Array<{
      id: string;
      name: string;
      registeredBy: string | undefined;
      registeredByLower: string | undefined;
    }> = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      repos.push({
        id: doc.id,
        name: data.name || 'Unnamed',
        registeredBy: data.registeredBy,
        registeredByLower: data.registeredByLower,
      });
    });

    return NextResponse.json({
      success: true,
      currentUserLogin: session.user.login || session.user.id,
      currentUserLoginLower: (session.user.login || session.user.id || '').toLowerCase(),
      totalRepos: repos.length,
      repos,
    });
  } catch (error) {
    // Handle auth errors (401/403) with proper responses
    const authResponse = handleAuthError(error);
    if (authResponse.status !== 500) {
      return authResponse;
    }
    console.error('Debug repos error:', error);
    return NextResponse.json(
      { success: false, error: 'Debug failed' },
      { status: 500 }
    );
  }
}
