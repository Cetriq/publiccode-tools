import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getFirebaseAdmin, COLLECTIONS } from '@/lib/firebase';
import { FieldValue } from 'firebase-admin/firestore';
import { isOrgMember, canManageOrg, Organization } from '@/types/organization';
import type { ServiceOffering, Certification, ProjectSupport } from '@/types/organization';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface ProfileUpdateRequest {
  // Organization type
  type?: 'developer' | 'service_provider' | 'municipality' | 'public_sector' | 'other';

  // Basic info
  description?: string;
  website?: string;
  contactEmail?: string;
  location?: string;
  foundedYear?: number;
  employeeCount?: '1-10' | '11-50' | '51-200' | '201-500' | '500+';

  // Service provider fields
  serviceOfferings?: ServiceOffering[];
  certifications?: Certification[];
}

// GET /api/organizations/[orgId]/profile - Get organization profile (public)
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

    // Return public profile data
    return NextResponse.json({
      success: true,
      organization: {
        id: orgDoc.id,
        name: data.name,
        slug: data.slug,
        type: data.type,
        verified: data.verified,
        avatarUrl: data.avatarUrl,
        description: data.description || '',
        website: data.website || '',
        contactEmail: data.contactEmail || '',
        location: data.location || '',
        foundedYear: data.foundedYear,
        employeeCount: data.employeeCount,
        serviceOfferings: data.serviceOfferings || [],
        certifications: data.certifications || [],
        supportedProjects: data.supportedProjects || [],
        referenceCustomers: data.referenceCustomers || [],
        repoCount: data.repoCount || 0,
      },
    });
  } catch (error) {
    console.error('Failed to fetch organization profile:', error);
    return NextResponse.json(
      { success: false, message: 'Kunde inte hämta profil' },
      { status: 500 }
    );
  }
}

// PATCH /api/organizations/[orgId]/profile - Update organization profile
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orgId: string }> }
): Promise<NextResponse> {
  let debugStep = 'init';
  try {
    debugStep = 'getSession';
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Du måste vara inloggad' },
        { status: 401 }
      );
    }

    debugStep = 'getParams';
    const { orgId } = await params;

    debugStep = 'getFirebase';
    const { db } = getFirebaseAdmin();

    debugStep = 'getOrgDoc';
    // Check if organization exists and user has permission
    const orgDoc = await db.collection(COLLECTIONS.ORGANIZATIONS).doc(orgId).get();

    if (!orgDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'Organisation hittades inte' },
        { status: 404 }
      );
    }

    debugStep = 'getOrgData';
    const orgData = orgDoc.data() as Organization;

    debugStep = 'canManageOrg';
    if (!canManageOrg(orgData, session.user.id)) {
      return NextResponse.json(
        { success: false, message: 'Du har inte behörighet att redigera denna organisation' },
        { status: 403 }
      );
    }

    debugStep = 'parseBody';
    const body: ProfileUpdateRequest = await request.json();

    // Build update object with only allowed fields
    const updateData: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    // Organization type
    if (body.type !== undefined) {
      const validTypes = ['developer', 'service_provider', 'municipality', 'public_sector', 'other'];
      if (validTypes.includes(body.type)) {
        updateData.type = body.type;
      }
    }

    // Basic info fields (handle empty strings gracefully)
    if (body.description !== undefined) {
      updateData.description = typeof body.description === 'string'
        ? body.description.slice(0, 1000)
        : '';
    }
    if (body.website !== undefined) {
      updateData.website = typeof body.website === 'string'
        ? body.website.slice(0, 200)
        : '';
    }
    if (body.contactEmail !== undefined) {
      updateData.contactEmail = typeof body.contactEmail === 'string'
        ? body.contactEmail.slice(0, 100)
        : '';
    }
    if (body.location !== undefined) {
      updateData.location = typeof body.location === 'string'
        ? body.location.slice(0, 100)
        : '';
    }
    if (body.foundedYear !== undefined && body.foundedYear !== null) {
      const year = parseInt(String(body.foundedYear));
      if (!isNaN(year) && year >= 1800 && year <= new Date().getFullYear()) {
        updateData.foundedYear = year;
      }
    }
    if (body.employeeCount !== undefined) {
      const validCounts = ['1-10', '11-50', '51-200', '201-500', '500+'];
      if (validCounts.includes(body.employeeCount)) {
        updateData.employeeCount = body.employeeCount;
      } else {
        // Clear if empty string or invalid
        updateData.employeeCount = '';
      }
    }

    // Service provider fields (validate structure)
    if (body.serviceOfferings !== undefined) {
      if (Array.isArray(body.serviceOfferings)) {
        const validServiceTypes = ['support', 'hosting', 'development', 'training', 'consulting', 'integration', 'migration'];
        const validPricingModels = ['hourly', 'monthly', 'yearly', 'project', 'custom'];
        const validPriceIndicators = ['budget', 'mid-range', 'premium'];

        const validatedOfferings = body.serviceOfferings
          .filter(offering => offering && typeof offering === 'object' && validServiceTypes.includes(offering.type))
          .slice(0, 10) // Max 10 offerings
          .map(offering => ({
            type: offering.type,
            description: typeof offering.description === 'string' ? offering.description.slice(0, 500) : '',
            pricingModel: validPricingModels.includes(offering.pricingModel || '') ? offering.pricingModel : undefined,
            priceIndicator: validPriceIndicators.includes(offering.priceIndicator || '') ? offering.priceIndicator : undefined,
            minPrice: typeof offering.minPrice === 'number' ? Math.max(0, offering.minPrice) : undefined,
            maxPrice: typeof offering.maxPrice === 'number' ? Math.max(0, offering.maxPrice) : undefined,
          }));

        updateData.serviceOfferings = validatedOfferings;
      } else {
        updateData.serviceOfferings = [];
      }
    }

    if (body.certifications !== undefined) {
      if (Array.isArray(body.certifications)) {
        const validatedCertifications = body.certifications
          .filter(cert => cert && typeof cert === 'object' && cert.name && typeof cert.name === 'string' && cert.name.length > 0)
          .slice(0, 20) // Max 20 certifications
          .map(cert => ({
            name: cert.name.slice(0, 100),
            issuer: typeof cert.issuer === 'string' ? cert.issuer.slice(0, 100) : '',
            validUntil: typeof cert.validUntil === 'string' ? cert.validUntil : '',
            verificationUrl: typeof cert.verificationUrl === 'string' ? cert.verificationUrl.slice(0, 500) : '',
          }));

        updateData.certifications = validatedCertifications;
      } else {
        updateData.certifications = [];
      }
    }

    await db.collection(COLLECTIONS.ORGANIZATIONS).doc(orgId).update(updateData);

    return NextResponse.json({
      success: true,
      message: 'Profilen har uppdaterats',
    });
  } catch (error) {
    console.error('Failed to update organization profile:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, message: 'Kunde inte uppdatera profil', error: errorMessage, debugStep },
      { status: 500 }
    );
  }
}
