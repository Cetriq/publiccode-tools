import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/lib/firebase';

// Force dynamic rendering - prevents build-time Firebase initialization
export const dynamic = 'force-dynamic';

export interface MyRepo {
  id: string;
  name: string;
  url: string;
  description: string;
  score: number;
  categories: string[];
  disFase1: boolean;
  registeredAt: string;
  lastUpdated: string;
}

// GET /api/repos/my - Get repos registered by the current user
export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // User ID is the GitHub login (username), converted to lowercase for matching
    const userLogin = session.user.login || session.user.id;

    if (!userLogin) {
      return NextResponse.json(
        { success: false, error: 'Could not determine user identity' },
        { status: 400 }
      );
    }

    const userLoginLower = userLogin.toLowerCase();

    console.log('My repos query - userLogin:', userLogin, 'userLoginLower:', userLoginLower);

    const db = getDb();

    // Query repos where registeredByLower matches the current user (case-insensitive)
    // Note: orderBy removed temporarily until index is built
    const snapshot = await db
      .collection(COLLECTIONS.REPOSITORIES)
      .where('registeredByLower', '==', userLoginLower)
      .limit(50)
      .get();

    console.log('My repos query - found:', snapshot.size, 'documents');

    const repos: MyRepo[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      repos.push({
        id: doc.id,
        name: data.name || 'Unnamed',
        url: data.url || '',
        description: data.shortDescription || data.description || '',
        score: data.score || 0,
        categories: data.categories || [],
        disFase1: data.disFase1 || false,
        registeredAt: data.registeredAt?.toDate?.()?.toISOString() || '',
        lastUpdated: data.lastUpdated?.toDate?.()?.toISOString() || '',
      });
    });

    return NextResponse.json({ success: true, repos });
  } catch (error) {
    console.error('My repos GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
