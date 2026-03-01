import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS } from '@/lib/firebase';
import { requireAdmin, handleAuthError } from '@/lib/rbac';
import { FieldValue } from 'firebase-admin/firestore';

// Force dynamic rendering - prevents build-time Firebase initialization
export const dynamic = 'force-dynamic';

// GET /api/admin/organizations - List all organizations (admin only)
export async function GET(): Promise<NextResponse> {
  try {
    await requireAdmin();

    const db = getDb();
    const snapshot = await db
      .collection(COLLECTIONS.ORGANIZATIONS)
      .orderBy('createdAt', 'desc')
      .get();

    const organizations = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        slug: data.slug,
        type: data.type || 'developer',
        verified: data.verified || false,
        avatarUrl: data.avatarUrl,
        repoCount: data.repoCount || 0,
        capabilities: data.capabilities || [],
        createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || null,
      };
    });

    // Count stats
    const stats = {
      total: organizations.length,
      verified: organizations.filter((o) => o.verified).length,
      pending: organizations.filter((o) => !o.verified).length,
      byType: {
        developer: organizations.filter((o) => o.type === 'developer').length,
        service_provider: organizations.filter((o) => o.type === 'service_provider').length,
        municipality: organizations.filter((o) => o.type === 'municipality').length,
        public_sector: organizations.filter((o) => o.type === 'public_sector').length,
        other: organizations.filter((o) => o.type === 'other').length,
      },
    };

    return NextResponse.json({
      success: true,
      organizations,
      stats,
    });
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse.status !== 500) {
      return authResponse;
    }
    console.error('Admin organizations GET error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/organizations - Verify/unverify an organization
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    await requireAdmin();

    const body = await request.json();
    const { orgId, verified } = body;

    if (!orgId || typeof verified !== 'boolean') {
      return NextResponse.json(
        { success: false, message: 'Missing orgId or verified status' },
        { status: 400 }
      );
    }

    const db = getDb();
    const orgRef = db.collection(COLLECTIONS.ORGANIZATIONS).doc(orgId);
    const orgDoc = await orgRef.get();

    if (!orgDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'Organization not found' },
        { status: 404 }
      );
    }

    await orgRef.update({
      verified,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      message: verified ? 'Organization verified' : 'Organization unverified',
    });
  } catch (error) {
    const authResponse = handleAuthError(error);
    if (authResponse.status !== 500) {
      return authResponse;
    }
    console.error('Admin organizations PATCH error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
