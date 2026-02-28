import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/lib/firebase';

// GET /api/admin/debug-repos - Debug: show all repos with registeredBy fields
export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

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
    console.error('Debug repos error:', error);
    return NextResponse.json(
      { success: false, error: 'Debug failed' },
      { status: 500 }
    );
  }
}
