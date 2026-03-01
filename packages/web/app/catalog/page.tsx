import { Metadata } from 'next';
import { CatalogClient } from './CatalogClient';
import type { CatalogRepository } from '@/types/registry';

export const metadata: Metadata = {
  title: 'Katalog - SamhällsKodex',
  description: 'Utforska öppen källkod i svenska offentliga sektorn. Hitta projekt med publiccode.yml.',
};

// Force dynamic rendering to avoid build-time fetch issues
export const dynamic = 'force-dynamic';

// Revalidate every 5 minutes
export const revalidate = 300;

async function getRepositories(): Promise<CatalogRepository[]> {
  try {
    // Import Firebase dynamically to avoid build-time initialization
    const { getDb, COLLECTIONS } = await import('@/lib/firebase');
    const db = getDb();

    const snapshot = await db
      .collection(COLLECTIONS.REPOSITORIES)
      .orderBy('score', 'desc')
      .get();

    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        url: data.url,
        name: data.name,
        description: data.description || '',
        score: data.score,
        categories: data.categories || [],
        disFase1: data.disFase1 || false,
        organization: data.organization,
        language: data.language,
        license: data.license,
        lastUpdated: data.lastUpdated?.toDate?.()?.toISOString() || null,
      };
    });
  } catch (error) {
    console.error('Error fetching repositories:', error);
    // Return empty array - catalog will show "no projects" message
    return [];
  }
}

export default async function CatalogPage() {
  const repositories = await getRepositories();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header section */}
      <div className="pt-24 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Projektkatalog
            </h1>
            <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
              Utforska öppen källkod i svenska offentliga sektorn.
              Alla projekt har minst 60 poängs SamhällsKodex Score.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4 max-w-3xl mx-auto">
            <div className="rounded-xl bg-white/5 p-4 text-center backdrop-blur">
              <div className="text-2xl font-bold text-white">
                {repositories.length}
              </div>
              <div className="text-sm text-slate-400">Projekt</div>
            </div>
            <div className="rounded-xl bg-white/5 p-4 text-center backdrop-blur">
              <div className="text-2xl font-bold text-white">
                {repositories.filter(r => r.disFase1).length}
              </div>
              <div className="text-sm text-slate-400">DIS Fas 1</div>
            </div>
            <div className="rounded-xl bg-white/5 p-4 text-center backdrop-blur">
              <div className="text-2xl font-bold text-white">
                {new Set(repositories.flatMap(r => r.categories)).size}
              </div>
              <div className="text-sm text-slate-400">Kategorier</div>
            </div>
            <div className="rounded-xl bg-white/5 p-4 text-center backdrop-blur">
              <div className="text-2xl font-bold text-white">
                {repositories.length > 0
                  ? Math.round(repositories.reduce((sum, r) => sum + r.score, 0) / repositories.length)
                  : 0}
              </div>
              <div className="text-sm text-slate-400">Snitt-score</div>
            </div>
          </div>
        </div>
      </div>

      {/* Catalog content */}
      <div className="pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <CatalogClient initialRepositories={repositories} />
        </div>
      </div>
    </div>
  );
}
