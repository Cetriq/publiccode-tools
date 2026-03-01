import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin, COLLECTIONS } from '@/lib/firebase';
import type { Organization, ServiceType } from '@/types/organization';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface ProviderListItem {
  id: string;
  name: string;
  slug: string;
  type: string;
  verified: boolean;
  avatarUrl: string;
  description?: string;
  website?: string;
  location?: string;
  employeeCount?: string;
  serviceTypes: ServiceType[];
  certificationCount: number;
  supportedProjectCount: number;
  referenceCustomerCount: number;
}

// GET /api/providers - List all service providers with optional filters
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { db } = getFirebaseAdmin();
    const { searchParams } = new URL(request.url);

    // Filter params
    const serviceType = searchParams.get('serviceType');
    const location = searchParams.get('location');
    const verifiedOnly = searchParams.get('verified') !== 'false'; // Default to verified only
    const search = searchParams.get('search')?.toLowerCase();

    // Build query
    let query = db.collection(COLLECTIONS.ORGANIZATIONS)
      .where('type', 'in', ['service_provider', 'developer']);

    if (verifiedOnly) {
      query = query.where('verified', '==', true);
    }

    const snapshot = await query.get();

    let providers: ProviderListItem[] = snapshot.docs.map((doc) => {
      const data = doc.data() as Organization;

      // Extract unique service types from offerings
      const serviceTypes: ServiceType[] = [];
      if (data.serviceOfferings) {
        data.serviceOfferings.forEach(offering => {
          if (!serviceTypes.includes(offering.type)) {
            serviceTypes.push(offering.type);
          }
        });
      }

      return {
        id: doc.id,
        name: data.name,
        slug: data.slug,
        type: data.type,
        verified: data.verified,
        avatarUrl: data.avatarUrl,
        description: data.description,
        website: data.website,
        location: data.location,
        employeeCount: data.employeeCount,
        serviceTypes,
        certificationCount: data.certifications?.length || 0,
        supportedProjectCount: data.supportedProjects?.length || 0,
        referenceCustomerCount: data.referenceCustomers?.length || 0,
      };
    });

    // Apply filters
    if (serviceType) {
      providers = providers.filter(p => p.serviceTypes.includes(serviceType as ServiceType));
    }

    if (location) {
      providers = providers.filter(p =>
        p.location?.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (search) {
      providers = providers.filter(p =>
        p.name.toLowerCase().includes(search) ||
        p.description?.toLowerCase().includes(search) ||
        p.location?.toLowerCase().includes(search)
      );
    }

    // Sort: verified first, then by supported project count, then by name
    providers.sort((a, b) => {
      if (a.verified !== b.verified) return b.verified ? 1 : -1;
      if (a.supportedProjectCount !== b.supportedProjectCount) {
        return b.supportedProjectCount - a.supportedProjectCount;
      }
      return a.name.localeCompare(b.name, 'sv');
    });

    // Get unique locations for filter dropdown
    const locations = [...new Set(
      providers
        .map(p => p.location)
        .filter((loc): loc is string => !!loc)
    )].sort((a, b) => a.localeCompare(b, 'sv'));

    // Get all used service types
    const usedServiceTypes = [...new Set(
      providers.flatMap(p => p.serviceTypes)
    )];

    return NextResponse.json({
      success: true,
      providers,
      total: providers.length,
      filters: {
        locations,
        serviceTypes: usedServiceTypes,
      },
    });
  } catch (error) {
    console.error('Failed to fetch providers:', error);
    return NextResponse.json(
      { success: false, message: 'Kunde inte hämta leverantörer' },
      { status: 500 }
    );
  }
}
