import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDb, COLLECTIONS } from '@/lib/firebase';

// POST /api/admin/migrate-registered-by - Set registeredBy to current user's login for all repos without it
export async function POST(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the current user's login (GitHub username)
    const userLogin = session.user.login || session.user.id || 'unknown';
    const userLoginLower = userLogin.toLowerCase();

    const db = getDb();
    const snapshot = await db.collection(COLLECTIONS.REPOSITORIES).get();

    let updated = 0;
    let skipped = 0;
    const details: Array<{ id: string; name: string; action: string }> = [];
    const batch = db.batch();

    snapshot.forEach((doc) => {
      const data = doc.data();
      const registeredBy = data.registeredBy;
      const registeredByLower = data.registeredByLower;

      // If no registeredBy at all, or it's a numeric ID (not a username), set to current user
      const needsUpdate = !registeredBy || !registeredByLower || /^\d+$/.test(registeredBy);

      if (needsUpdate) {
        batch.update(doc.ref, {
          registeredBy: userLogin,
          registeredByLower: userLoginLower,
        });
        updated++;
        details.push({
          id: doc.id,
          name: data.name || 'Unnamed',
          action: `Set registeredBy to ${userLogin}`,
        });
      } else {
        skipped++;
        details.push({
          id: doc.id,
          name: data.name || 'Unnamed',
          action: `Skipped (already has registeredBy: ${registeredBy})`,
        });
      }
    });

    if (updated > 0) {
      await batch.commit();
    }

    return NextResponse.json({
      success: true,
      message: `Migration complete. Updated: ${updated}, Skipped: ${skipped}`,
      updated,
      skipped,
      currentUser: userLogin,
      details,
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { success: false, error: 'Migration failed' },
      { status: 500 }
    );
  }
}
