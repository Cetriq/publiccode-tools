import { NextRequest, NextResponse } from 'next/server';
import { getDb, COLLECTIONS } from '@/lib/firebase';

// Force dynamic rendering - prevents build-time Firebase initialization
export const dynamic = 'force-dynamic';

interface ProjectDetail {
  id: string;
  url: string;
  name: string;
  description: string;
  score: number;
  categories: string[];
  disFase1: boolean;
  owner: string;
  license: string;
  developmentStatus: string;
  maintenanceType: string;
  lastUpdated: string;
  registeredAt: string;
}

// GET /api/registry/[id] - Get a single repository by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Missing project ID' },
        { status: 400 }
      );
    }

    const db = getDb();
    const docRef = db.collection(COLLECTIONS.REPOSITORIES).doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    const data = doc.data();
    const project: ProjectDetail = {
      id: doc.id,
      url: data?.url || '',
      name: data?.name || '',
      description: data?.description || '',
      score: data?.score || 0,
      categories: data?.categories || [],
      disFase1: data?.disFase1 || false,
      owner: data?.owner || '',
      license: data?.license || '',
      developmentStatus: data?.developmentStatus || '',
      maintenanceType: data?.maintenanceType || '',
      lastUpdated: data?.lastUpdated?.toDate?.()?.toISOString() || new Date().toISOString(),
      registeredAt: data?.registeredAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    };

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Registry GET [id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
