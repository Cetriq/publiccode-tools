import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getFirebaseAdmin, COLLECTIONS } from '@/lib/firebase';
import { isOrgMember, canManageOrg } from '@/types/organization';
import type { Organization } from '@/types/organization';
import type { OrgType } from '@/types/rbac';
import { FieldValue } from 'firebase-admin/firestore';
import { notifyNewServiceProvider } from '@/lib/email';

interface RouteParams {
  params: Promise<{ orgId: string }>;
}

// GET /api/organizations/[orgId] - Get a single organization
export async function GET(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orgId } = await params;
    const { db } = getFirebaseAdmin();

    const orgDoc = await db.collection(COLLECTIONS.ORGANIZATIONS).doc(orgId).get();

    if (!orgDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'Organization not found' },
        { status: 404 }
      );
    }

    const orgData = orgDoc.data() as Organization;

    // Check if user is a member of this organization
    if (!isOrgMember(orgData, session.user.id)) {
      return NextResponse.json(
        { success: false, message: 'Not a member of this organization' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      organization: {
        id: orgDoc.id,
        name: orgData.name,
        slug: orgData.slug,
        type: orgData.type || 'developer',
        verified: orgData.verified || false,
        avatarUrl: orgData.avatarUrl,
        repoCount: orgData.repoCount || 0,
        capabilities: orgData.capabilities || [],
        createdAt: orgData.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: orgData.updatedAt?.toDate?.()?.toISOString() || null,
        canManage: canManageOrg(orgData, session.user.id),
      },
    });
  } catch (error) {
    console.error('Failed to fetch organization:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/organizations/[orgId] - Update organization (type, capabilities)
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { orgId } = await params;
    const { db } = getFirebaseAdmin();

    const orgDoc = await db.collection(COLLECTIONS.ORGANIZATIONS).doc(orgId).get();

    if (!orgDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'Organization not found' },
        { status: 404 }
      );
    }

    const orgData = orgDoc.data() as Organization;

    // Check if user can manage this organization
    if (!canManageOrg(orgData, session.user.id)) {
      return NextResponse.json(
        { success: false, message: 'Not authorized to manage this organization' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type, capabilities } = body;

    // Validate type if provided
    const validTypes: OrgType[] = ['developer', 'service_provider', 'municipality', 'public_sector', 'other'];
    if (type && !validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, message: 'Invalid organization type' },
        { status: 400 }
      );
    }

    // Validate capabilities if provided
    if (capabilities && !Array.isArray(capabilities)) {
      return NextResponse.json(
        { success: false, message: 'Capabilities must be an array' },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (type) {
      updateData.type = type;
    }

    if (capabilities !== undefined) {
      // Sanitize and limit capabilities
      updateData.capabilities = capabilities
        .filter((c: unknown) => typeof c === 'string' && c.trim().length > 0)
        .map((c: string) => c.trim())
        .slice(0, 10); // Max 10 capabilities
    }

    await db.collection(COLLECTIONS.ORGANIZATIONS).doc(orgId).update(updateData);

    // Notify admin if organization changed to service_provider
    const previousType = orgData.type || 'developer';
    if (type === 'service_provider' && previousType !== 'service_provider') {
      // Fire-and-forget notification (don't block response)
      notifyNewServiceProvider({
        id: orgId,
        name: orgData.name,
        capabilities: capabilities || orgData.capabilities || [],
        avatarUrl: orgData.avatarUrl,
      }).catch((err) => {
        console.error('Failed to send service provider notification:', err);
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Organization updated',
    });
  } catch (error) {
    console.error('Failed to update organization:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
