import { NextRequest, NextResponse } from 'next/server';
import { getFirebaseAdmin, COLLECTIONS } from '@/lib/firebase';
import type { Organization } from '@/types/organization';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// GET /api/projects/[projectId]/providers - Get service providers that support this project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
): Promise<NextResponse> {
  try {
    const { projectId } = await params;
    const { db } = getFirebaseAdmin();

    // Query all organizations that have this project in supportedProjects
    // Note: Firestore doesn't support querying array of objects directly,
    // so we need to get all service providers and filter
    const orgsSnapshot = await db
      .collection(COLLECTIONS.ORGANIZATIONS)
      .where('type', 'in', ['service_provider', 'developer'])
      .where('verified', '==', true)
      .get();

    const providers: Array<{
      id: string;
      name: string;
      slug: string;
      avatarUrl: string;
      description?: string;
      location?: string;
      services: string[];
      experienceLevel: string;
      deployments?: number;
      supportDescription?: string;
    }> = [];

    for (const doc of orgsSnapshot.docs) {
      const data = doc.data() as Organization;
      const supportedProjects = data.supportedProjects || [];

      const projectSupport = supportedProjects.find(p => p.projectId === projectId);

      if (projectSupport) {
        providers.push({
          id: doc.id,
          name: data.name,
          slug: data.slug,
          avatarUrl: data.avatarUrl,
          description: data.description,
          location: data.location,
          services: projectSupport.services,
          experienceLevel: projectSupport.experienceLevel,
          deployments: projectSupport.deployments,
          supportDescription: projectSupport.description,
        });
      }
    }

    // Sort by experience level (expert first) and deployments
    const levelOrder = { expert: 0, intermediate: 1, beginner: 2 };
    providers.sort((a, b) => {
      const levelDiff = levelOrder[a.experienceLevel as keyof typeof levelOrder] -
                       levelOrder[b.experienceLevel as keyof typeof levelOrder];
      if (levelDiff !== 0) return levelDiff;
      return (b.deployments || 0) - (a.deployments || 0);
    });

    return NextResponse.json({
      success: true,
      providers,
      total: providers.length,
    });
  } catch (error) {
    console.error('Failed to fetch project providers:', error);
    return NextResponse.json(
      { success: false, message: 'Kunde inte hämta leverantörer' },
      { status: 500 }
    );
  }
}
