import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getFirebaseAdmin, hashToken, COLLECTIONS } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { randomBytes } from 'crypto';
import type {
  CreateOrganizationRequest,
  CreateOrganizationResponse,
} from '@/types/organization';

// POST /api/organizations - Create a new organization
export async function POST(
  request: NextRequest
): Promise<NextResponse<CreateOrganizationResponse>> {
  try {
    // Get the session
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized - please sign in' },
        { status: 401 }
      );
    }

    // Parse the request body
    const body: CreateOrganizationRequest = await request.json();
    const { orgId, orgName, orgAvatar } = body;

    if (!orgId || !orgName) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { db } = getFirebaseAdmin();

    // Check if organization already exists
    const existingOrg = await db.collection(COLLECTIONS.ORGANIZATIONS).doc(orgId).get();
    if (existingOrg.exists) {
      const orgData = existingOrg.data();
      // Check if current user is an admin
      if (orgData?.adminUsers?.includes(session.user.id)) {
        return NextResponse.json(
          {
            success: false,
            message: 'Organisationen ar redan registrerad. Ga till Dashboard for att hantera den.',
          },
          { status: 409 }
        );
      } else {
        return NextResponse.json(
          {
            success: false,
            message: 'Organisationen ar redan registrerad av en annan anvandare.',
          },
          { status: 409 }
        );
      }
    }

    // Generate API key
    const apiKey = randomBytes(32).toString('hex');
    const apiKeyHash = hashToken(apiKey);

    // Create the organization document
    const orgDoc = {
      id: orgId,
      name: orgName,
      slug: orgName.toLowerCase(),
      avatarUrl: orgAvatar || '',
      apiKeyHash,
      adminUsers: [session.user.id],
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      repoCount: 0,
    };

    await db.collection(COLLECTIONS.ORGANIZATIONS).doc(orgId).set(orgDoc);

    // Also add the API key hash to registry_tokens for validation
    // This allows the existing registry API to work with org-specific keys
    await db.collection(COLLECTIONS.REGISTRY_TOKENS).add({
      token: apiKeyHash,
      name: `Organization: ${orgName}`,
      organizationId: orgId,
      enabled: true,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      apiKey, // Return the plain API key - only time it's shown
      organization: {
        id: orgId,
        name: orgName,
        slug: orgName.toLowerCase(),
      },
    });
  } catch (error) {
    console.error('Failed to create organization:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/organizations - Get current user's organizations
export async function GET(): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { db } = getFirebaseAdmin();

    // Query organizations where current user is an admin
    const orgsSnapshot = await db
      .collection(COLLECTIONS.ORGANIZATIONS)
      .where('adminUsers', 'array-contains', session.user.id)
      .get();

    const organizations = orgsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        slug: data.slug,
        avatarUrl: data.avatarUrl,
        repoCount: data.repoCount || 0,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      };
    });

    return NextResponse.json({
      success: true,
      organizations,
    });
  } catch (error) {
    console.error('Failed to fetch organizations:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
