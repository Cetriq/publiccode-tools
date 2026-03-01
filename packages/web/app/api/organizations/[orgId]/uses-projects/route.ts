import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin, COLLECTIONS } from '@/lib/firebase';
import { requireAuth } from '@/lib/rbac';
import { canManageOrg, type Organization } from '@/types/organization';
import { FieldValue } from 'firebase-admin/firestore';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET /api/organizations/[orgId]/uses-projects - Get projects this org uses
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
): Promise<NextResponse> {
  try {
    const { orgId } = await params;
    const { db } = getFirebaseAdmin();

    const orgDoc = await db.collection(COLLECTIONS.ORGANIZATIONS).doc(orgId).get();

    if (!orgDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'Organisationen hittades inte' },
        { status: 404 }
      );
    }

    const orgData = orgDoc.data() as Organization;
    const projectIds = orgData.usesProjects || [];

    // Fetch project details
    const projects: Array<{
      id: string;
      name: string;
      url: string;
      description?: string;
    }> = [];

    if (projectIds.length > 0) {
      // Fetch in batches of 10 (Firestore limit for 'in' queries)
      for (let i = 0; i < projectIds.length; i += 10) {
        const batch = projectIds.slice(i, i + 10);
        const snapshot = await db
          .collection(COLLECTIONS.REPOSITORIES)
          .where('__name__', 'in', batch)
          .get();

        for (const doc of snapshot.docs) {
          const data = doc.data();
          projects.push({
            id: doc.id,
            name: data.name || data.publiccode?.name || doc.id,
            url: data.repoUrl || data.publiccode?.url,
            description: data.publiccode?.description?.sv || data.publiccode?.description?.en,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error('Failed to fetch used projects:', error);
    return NextResponse.json(
      { success: false, message: 'Kunde inte hämta projekt' },
      { status: 500 }
    );
  }
}

// POST /api/organizations/[orgId]/uses-projects - Add a project this org uses
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
): Promise<NextResponse> {
  try {
    const { session, user } = await requireAuth();
    const { orgId } = await params;
    const { db } = getFirebaseAdmin();
    const body = await request.json();

    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: 'projectId krävs' },
        { status: 400 }
      );
    }

    // Get organization
    const orgDoc = await db.collection(COLLECTIONS.ORGANIZATIONS).doc(orgId).get();

    if (!orgDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'Organisationen hittades inte' },
        { status: 404 }
      );
    }

    const orgData = orgDoc.data() as Organization;

    // Check if user can manage this organization
    if (!canManageOrg(orgData, user.id)) {
      return NextResponse.json(
        { success: false, message: 'Du har inte behörighet att hantera denna organisation' },
        { status: 403 }
      );
    }

    // Verify project exists
    const projectDoc = await db.collection(COLLECTIONS.REPOSITORIES).doc(projectId).get();
    if (!projectDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'Projektet hittades inte' },
        { status: 404 }
      );
    }

    // Add project to usesProjects (if not already there)
    await db.collection(COLLECTIONS.ORGANIZATIONS).doc(orgId).update({
      usesProjects: FieldValue.arrayUnion(projectId),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Projektet har lagts till',
    });
  } catch (error) {
    console.error('Failed to add used project:', error);
    return NextResponse.json(
      { success: false, message: 'Kunde inte lägga till projekt' },
      { status: 500 }
    );
  }
}

// DELETE /api/organizations/[orgId]/uses-projects - Remove a project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
): Promise<NextResponse> {
  try {
    const { session, user } = await requireAuth();
    const { orgId } = await params;
    const { db } = getFirebaseAdmin();
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: 'projectId krävs' },
        { status: 400 }
      );
    }

    // Get organization
    const orgDoc = await db.collection(COLLECTIONS.ORGANIZATIONS).doc(orgId).get();

    if (!orgDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'Organisationen hittades inte' },
        { status: 404 }
      );
    }

    const orgData = orgDoc.data() as Organization;

    // Check if user can manage this organization
    if (!canManageOrg(orgData, user.id)) {
      return NextResponse.json(
        { success: false, message: 'Du har inte behörighet att hantera denna organisation' },
        { status: 403 }
      );
    }

    // Remove project from usesProjects
    await db.collection(COLLECTIONS.ORGANIZATIONS).doc(orgId).update({
      usesProjects: FieldValue.arrayRemove(projectId),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Projektet har tagits bort',
    });
  } catch (error) {
    console.error('Failed to remove used project:', error);
    return NextResponse.json(
      { success: false, message: 'Kunde inte ta bort projekt' },
      { status: 500 }
    );
  }
}
