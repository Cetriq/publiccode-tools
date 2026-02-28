import { NextRequest, NextResponse } from 'next/server';
import { getDb, validateApiToken, hashUrl, COLLECTIONS } from '@/lib/firebase';
import type { RegistrationPayload, RegistrationResponse, CatalogRepository } from '@/types/registry';
import { FieldValue } from 'firebase-admin/firestore';

const MIN_SCORE = 60;

// POST /api/registry - Register or update a repository
export async function POST(request: NextRequest): Promise<NextResponse<RegistrationResponse>> {
  try {
    // Validate API key
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Missing or invalid Authorization header' },
        { status: 401 }
      );
    }

    const apiToken = authHeader.slice(7); // Remove "Bearer "
    const isValidToken = await validateApiToken(apiToken);

    if (!isValidToken) {
      return NextResponse.json(
        { success: false, message: 'Invalid API token' },
        { status: 401 }
      );
    }

    // Parse and validate payload
    let payload: RegistrationPayload;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields: (keyof RegistrationPayload)[] = [
      'url', 'name', 'score', 'categories', 'owner', 'license', 'developmentStatus', 'maintenanceType'
    ];

    for (const field of requiredFields) {
      if (payload[field] === undefined || payload[field] === null) {
        return NextResponse.json(
          { success: false, message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate score
    if (typeof payload.score !== 'number' || payload.score < MIN_SCORE) {
      return NextResponse.json(
        { success: false, message: `Score must be at least ${MIN_SCORE}. Got: ${payload.score}` },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(payload.url);
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Create document
    const db = getDb();
    const urlHash = hashUrl(payload.url);
    const docRef = db.collection(COLLECTIONS.REPOSITORIES).doc(urlHash);

    // Check if document exists
    const existingDoc = await docRef.get();
    const isUpdate = existingDoc.exists;

    const documentData = {
      url: payload.url.trim(),
      name: payload.name.trim(),
      description: (payload.description || '').trim().slice(0, 300),
      score: payload.score,
      categories: payload.categories || [],
      disFase1: payload.disFase1 || false,
      owner: payload.owner.trim(),
      license: payload.license,
      developmentStatus: payload.developmentStatus,
      maintenanceType: payload.maintenanceType,
      urlHash,
      lastUpdated: FieldValue.serverTimestamp(),
      ...(isUpdate ? {} : { registeredAt: FieldValue.serverTimestamp() }),
    };

    await docRef.set(documentData, { merge: true });

    return NextResponse.json({
      success: true,
      message: isUpdate ? 'Repository updated' : 'Repository registered',
      id: urlHash,
      registered: !isUpdate,
      updated: isUpdate,
    });
  } catch (error) {
    console.error('Registry POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/registry - Get repositories or check if a repo exists
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    const db = getDb();

    // If URL is provided, check if that specific repo exists
    if (url) {
      const urlHash = hashUrl(url);
      const docRef = db.collection(COLLECTIONS.REPOSITORIES).doc(urlHash);
      const doc = await docRef.get();

      if (!doc.exists) {
        return NextResponse.json(
          { exists: false, message: 'Repository not found' },
          { status: 404 }
        );
      }

      const data = doc.data();
      return NextResponse.json({
        exists: true,
        repository: {
          id: doc.id,
          url: data?.url,
          name: data?.name,
          score: data?.score,
          lastUpdated: data?.lastUpdated?.toDate?.()?.toISOString(),
        },
      });
    }

    // Otherwise, return list of all repositories (for catalog)
    const category = searchParams.get('category');
    const disFase1Only = searchParams.get('disFase1') === 'true';
    const limitParam = parseInt(searchParams.get('limit') || '100', 10);

    let query = db.collection(COLLECTIONS.REPOSITORIES)
      .where('score', '>=', MIN_SCORE)
      .orderBy('score', 'desc')
      .limit(Math.min(limitParam, 500));

    if (disFase1Only) {
      query = db.collection(COLLECTIONS.REPOSITORIES)
        .where('score', '>=', MIN_SCORE)
        .where('disFase1', '==', true)
        .orderBy('score', 'desc')
        .limit(Math.min(limitParam, 500));
    }

    const snapshot = await query.get();

    const repositories: CatalogRepository[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();

      // Filter by category in memory (Firestore array-contains with other filters is limited)
      if (category && !data.categories?.includes(category)) {
        return;
      }

      repositories.push({
        id: doc.id,
        url: data.url,
        name: data.name,
        description: data.description || '',
        score: data.score,
        categories: data.categories || [],
        disFase1: data.disFase1 || false,
        owner: data.owner,
        license: data.license,
        developmentStatus: data.developmentStatus,
        lastUpdated: data.lastUpdated?.toDate?.()?.toISOString() || new Date().toISOString(),
      });
    });

    return NextResponse.json({
      count: repositories.length,
      repositories,
    });
  } catch (error) {
    console.error('Registry GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/registry - Remove a repository (admin only)
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // Validate API key
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Missing or invalid Authorization header' },
        { status: 401 }
      );
    }

    const apiToken = authHeader.slice(7);
    const isValidToken = await validateApiToken(apiToken);

    if (!isValidToken) {
      return NextResponse.json(
        { success: false, message: 'Invalid API token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json(
        { success: false, message: 'Missing url parameter' },
        { status: 400 }
      );
    }

    const db = getDb();
    const urlHash = hashUrl(url);
    const docRef = db.collection(COLLECTIONS.REPOSITORIES).doc(urlHash);

    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json(
        { success: false, message: 'Repository not found' },
        { status: 404 }
      );
    }

    await docRef.delete();

    return NextResponse.json({
      success: true,
      message: 'Repository deleted',
    });
  } catch (error) {
    console.error('Registry DELETE error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
