// Firebase Client SDK - For client-side reads
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Firestore,
  QueryConstraint,
} from 'firebase/firestore';
import type { CatalogRepository, CatalogFilters } from '@/types/registry';

let app: FirebaseApp | undefined;
let db: Firestore | undefined;

function getFirebaseClient(): { app: FirebaseApp; db: Firestore } {
  if (!app) {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!apiKey || !projectId) {
      throw new Error(
        'Missing Firebase client config. Set NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID.'
      );
    }

    const existingApps = getApps();
    if (existingApps.length > 0) {
      app = existingApps[0];
    } else {
      app = initializeApp({
        apiKey,
        projectId,
      });
    }
  }

  if (!db) {
    db = getFirestore(app);
  }

  return { app, db };
}

// Fetch repositories for catalog (client-side)
export async function fetchCatalogRepositories(
  filters?: Partial<CatalogFilters>
): Promise<CatalogRepository[]> {
  const { db } = getFirebaseClient();

  const constraints: QueryConstraint[] = [];

  // Always filter by minimum score
  constraints.push(where('score', '>=', 60));

  // Filter by category if specified
  if (filters?.category && filters.category !== '') {
    constraints.push(where('categories', 'array-contains', filters.category));
  }

  // Filter by DIS Fas 1
  if (filters?.disFase1Only) {
    constraints.push(where('disFase1', '==', true));
  }

  // Sort
  const sortField = filters?.sortBy || 'score';
  const sortDirection = filters?.sortOrder || 'desc';
  constraints.push(orderBy(sortField, sortDirection));

  // Limit results
  constraints.push(limit(100));

  const q = query(collection(db, 'repositories'), ...constraints);
  const snapshot = await getDocs(q);

  const repositories: CatalogRepository[] = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    repositories.push({
      id: doc.id,
      url: data.url,
      name: data.name,
      description: data.description,
      score: data.score,
      categories: data.categories || [],
      disFase1: data.disFase1 || false,
      owner: data.owner,
      license: data.license,
      developmentStatus: data.developmentStatus,
      lastUpdated: data.lastUpdated?.toDate?.()?.toISOString() || new Date().toISOString(),
    });
  });

  return repositories;
}

export { getFirebaseClient };
