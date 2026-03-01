import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getFirebaseAdmin, COLLECTIONS } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { canManageOrg, Organization, ProjectSupport } from '@/types/organization';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface AddProjectSupportRequest {
  projectId: string;
  services: ('support' | 'hosting' | 'development' | 'training' | 'consulting' | 'integration' | 'migration')[];
  experienceLevel: 'beginner' | 'intermediate' | 'expert';
  deployments?: number;
  description?: string;
}

// GET /api/organizations/[orgId]/supported-projects - Get projects this org supports
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
        { success: false, message: 'Organisation hittades inte' },
        { status: 404 }
      );
    }

    const data = orgDoc.data() as Organization;

    return NextResponse.json({
      success: true,
      supportedProjects: data.supportedProjects || [],
    });
  } catch (error) {
    console.error('Failed to fetch supported projects:', error);
    return NextResponse.json(
      { success: false, message: 'Kunde inte hämta projekt' },
      { status: 500 }
    );
  }
}

// POST /api/organizations/[orgId]/supported-projects - Add project support
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Du måste vara inloggad' },
        { status: 401 }
      );
    }

    const { orgId } = await params;
    const { db } = getFirebaseAdmin();

    // Check if organization exists and user has permission
    const orgDoc = await db.collection(COLLECTIONS.ORGANIZATIONS).doc(orgId).get();

    if (!orgDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'Organisation hittades inte' },
        { status: 404 }
      );
    }

    const orgData = orgDoc.data() as Organization;

    if (!canManageOrg(orgData, session.user.id)) {
      return NextResponse.json(
        { success: false, message: 'Du har inte behörighet' },
        { status: 403 }
      );
    }

    const body: AddProjectSupportRequest = await request.json();

    // Validate required fields
    if (!body.projectId || !body.services || body.services.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Projekt-ID och tjänster krävs' },
        { status: 400 }
      );
    }

    // Fetch the project to get its name and URL
    const projectDoc = await db.collection(COLLECTIONS.REPOSITORIES).doc(body.projectId).get();

    if (!projectDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'Projektet hittades inte' },
        { status: 404 }
      );
    }

    const projectData = projectDoc.data();

    // Check if already supporting this project
    const existingProjects = orgData.supportedProjects || [];
    if (existingProjects.some(p => p.projectId === body.projectId)) {
      return NextResponse.json(
        { success: false, message: 'Ni stödjer redan detta projekt. Använd PUT för att uppdatera.' },
        { status: 409 }
      );
    }

    // Validate services
    const validServices = ['support', 'hosting', 'development', 'training', 'consulting', 'integration', 'migration'];
    const filteredServices = body.services.filter(s => validServices.includes(s));

    if (filteredServices.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Minst en giltig tjänst krävs' },
        { status: 400 }
      );
    }

    // Validate experience level
    const validLevels = ['beginner', 'intermediate', 'expert'];
    if (!validLevels.includes(body.experienceLevel)) {
      return NextResponse.json(
        { success: false, message: 'Ogiltig erfarenhetsnivå' },
        { status: 400 }
      );
    }

    // Create the project support entry
    const newSupport: ProjectSupport = {
      projectId: body.projectId,
      projectName: projectData?.name || 'Okänt projekt',
      projectUrl: projectData?.url || '',
      services: filteredServices as ProjectSupport['services'],
      experienceLevel: body.experienceLevel,
      deployments: typeof body.deployments === 'number' ? Math.max(0, body.deployments) : undefined,
      description: body.description?.slice(0, 500) || undefined,
    };

    // Add to array
    await db.collection(COLLECTIONS.ORGANIZATIONS).doc(orgId).update({
      supportedProjects: FieldValue.arrayUnion(newSupport),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Projektstöd tillagt',
      projectSupport: newSupport,
    });
  } catch (error) {
    console.error('Failed to add project support:', error);
    return NextResponse.json(
      { success: false, message: 'Kunde inte lägga till projektstöd' },
      { status: 500 }
    );
  }
}

// DELETE /api/organizations/[orgId]/supported-projects - Remove project support
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Du måste vara inloggad' },
        { status: 401 }
      );
    }

    const { orgId } = await params;
    const { db } = getFirebaseAdmin();

    // Get projectId from query params
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { success: false, message: 'Projekt-ID krävs' },
        { status: 400 }
      );
    }

    // Check if organization exists and user has permission
    const orgDoc = await db.collection(COLLECTIONS.ORGANIZATIONS).doc(orgId).get();

    if (!orgDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'Organisation hittades inte' },
        { status: 404 }
      );
    }

    const orgData = orgDoc.data() as Organization;

    if (!canManageOrg(orgData, session.user.id)) {
      return NextResponse.json(
        { success: false, message: 'Du har inte behörighet' },
        { status: 403 }
      );
    }

    // Filter out the project
    const currentProjects = orgData.supportedProjects || [];
    const updatedProjects = currentProjects.filter(p => p.projectId !== projectId);

    if (currentProjects.length === updatedProjects.length) {
      return NextResponse.json(
        { success: false, message: 'Projektet finns inte i listan' },
        { status: 404 }
      );
    }

    await db.collection(COLLECTIONS.ORGANIZATIONS).doc(orgId).update({
      supportedProjects: updatedProjects,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: 'Projektstöd borttaget',
    });
  } catch (error) {
    console.error('Failed to remove project support:', error);
    return NextResponse.json(
      { success: false, message: 'Kunde inte ta bort projektstöd' },
      { status: 500 }
    );
  }
}
