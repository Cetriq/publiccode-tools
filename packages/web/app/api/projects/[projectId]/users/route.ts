import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin, COLLECTIONS } from '@/lib/firebase';
import type { Organization } from '@/types/organization';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET /api/projects/[projectId]/users - Get organizations that use this project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
): Promise<NextResponse> {
  try {
    const { projectId } = await params;
    const { db } = getFirebaseAdmin();

    // Query all organizations that have this project in usesProjects
    // Note: Firestore array-contains query
    const orgsSnapshot = await db
      .collection(COLLECTIONS.ORGANIZATIONS)
      .where('usesProjects', 'array-contains', projectId)
      .where('verified', '==', true)
      .get();

    const users: Array<{
      id: string;
      name: string;
      slug: string;
      type: string;
      avatarUrl: string;
      location?: string;
    }> = [];

    for (const doc of orgsSnapshot.docs) {
      const data = doc.data() as Organization;
      users.push({
        id: doc.id,
        name: data.name,
        slug: data.slug,
        type: data.type,
        avatarUrl: data.avatarUrl,
        location: data.location,
      });
    }

    // Sort by name
    users.sort((a, b) => a.name.localeCompare(b.name, 'sv'));

    return NextResponse.json({
      success: true,
      users,
      total: users.length,
    });
  } catch (error) {
    console.error('Failed to fetch project users:', error);
    return NextResponse.json(
      { success: false, message: 'Kunde inte hämta användare' },
      { status: 500 }
    );
  }
}
