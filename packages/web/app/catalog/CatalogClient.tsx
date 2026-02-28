'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { CatalogRepository, CatalogFilters } from '@/types/registry';

// Category translations (subset of core CATEGORIES, client-safe)
const CATEGORY_TRANSLATIONS: Record<string, string> = {
  ACCOUNTING: 'Bokföring',
  AGRI_ENVIRONMENT: 'Jordbruk & Miljö',
  ARCHIVING: 'Arkivering',
  CASE_MANAGEMENT: 'Ärendehantering',
  CIVIC_ENGAGEMENT: 'Medborgarengagemang',
  COLLABORATION: 'Samarbete',
  COMMUNICATIONS: 'Kommunikation',
  CONTENT_MANAGEMENT: 'Innehållshantering',
  DATA_ANALYTICS: 'Dataanalys',
  DATA_COLLECTION: 'Datainsamling',
  DOCUMENT_MANAGEMENT: 'Dokumenthantering',
  E_COMMERCE: 'E-handel',
  E_SIGNATURE: 'E-signering',
  EDUCATION: 'Utbildning',
  EMAIL_MANAGEMENT: 'E-posthantering',
  EVENT_MANAGEMENT: 'Eventhantering',
  FACILITY_MANAGEMENT: 'Fastighetsförvaltning',
  FINANCIAL_REPORTING: 'Finansiell rapportering',
  GEOGRAPHIC_INFORMATION: 'GIS',
  GOVERNMENT_WEBSITES: 'Myndighetswebb',
  HEALTHCARE: 'Hälso- och sjukvård',
  HELPDESK: 'Helpdesk',
  HR: 'Personal',
  IDENTITY_MANAGEMENT: 'Identitetshantering',
  IT_ASSET_MANAGEMENT: 'IT-tillgångshantering',
  IT_DEVELOPMENT: 'IT-utveckling',
  IT_SECURITY: 'IT-säkerhet',
  IT_SERVICE_MANAGEMENT: 'IT-tjänstehantering',
  KNOWLEDGE_MANAGEMENT: 'Kunskapshantering',
  LEARNING_MANAGEMENT: 'Lärandehantering',
  LEGAL_DOCUMENT_MANAGEMENT: 'Juridisk dokumenthantering',
  LOCAL_GOVERNMENT: 'Kommunal förvaltning',
  MARKETING: 'Marknadsföring',
  MOBILE_APPS: 'Mobilappar',
  OFFICE: 'Kontorsproduktivitet',
  OPEN_DATA: 'Öppna data',
  PAYMENTS: 'Betalningar',
  PERMITS: 'Tillstånd & Licenser',
  POLICY_AUTHORING: 'Policyförfattande',
  PROCUREMENT: 'Upphandling',
  PROJECT_MANAGEMENT: 'Projekthantering',
  PUBLIC_PARTICIPATION: 'Medborgardeltagande',
  RECORDS_MANAGEMENT: 'Diarieföring',
  REPORTING_ISSUES: 'Felanmälan',
  SOCIAL_MEDIA_MANAGEMENT: 'Sociala medier',
  SOCIAL_SERVICES: 'Socialtjänst',
  TRANSPORTATION: 'Transport',
  VISITOR_MANAGEMENT: 'Besökshantering',
  VOTING: 'Röstning',
  WASTE_MANAGEMENT: 'Avfallshantering',
  WEBSITE_MANAGEMENT: 'Webbhantering',
  WORKFLOW_MANAGEMENT: 'Arbetsflöden',
};

interface CatalogClientProps {
  initialRepositories: CatalogRepository[];
}

export function CatalogClient({ initialRepositories }: CatalogClientProps) {
  const [filters, setFilters] = useState<CatalogFilters>({
    search: '',
    category: '',
    disFase1Only: false,
    sortBy: 'score',
    sortOrder: 'desc',
  });

  const filteredRepositories = useMemo(() => {
    let result = [...initialRepositories];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        repo =>
          repo.name.toLowerCase().includes(searchLower) ||
          repo.description.toLowerCase().includes(searchLower) ||
          repo.owner.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (filters.category) {
      result = result.filter(repo =>
        repo.categories.includes(filters.category)
      );
    }

    // DIS Fas 1 filter
    if (filters.disFase1Only) {
      result = result.filter(repo => repo.disFase1);
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (filters.sortBy) {
        case 'score':
          comparison = a.score - b.score;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name, 'sv');
          break;
        case 'lastUpdated':
          comparison = new Date(a.lastUpdated).getTime() - new Date(b.lastUpdated).getTime();
          break;
      }
      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [initialRepositories, filters]);

  // Get unique categories from repositories
  const availableCategories = useMemo(() => {
    const cats = new Set<string>();
    initialRepositories.forEach(repo => {
      repo.categories.forEach(cat => cats.add(cat));
    });
    return Array.from(cats).sort();
  }, [initialRepositories]);

  const getCategoryName = (categoryId: string): string => {
    return CATEGORY_TRANSLATIONS[categoryId] || categoryId;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 70) return 'text-lime-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreBg = (score: number): string => {
    if (score >= 80) return 'bg-emerald-500/20';
    if (score >= 70) return 'bg-lime-500/20';
    if (score >= 60) return 'bg-yellow-500/20';
    return 'bg-orange-500/20';
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-8 rounded-xl bg-white/5 p-4 backdrop-blur">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-slate-300 mb-1">
              Sök
            </label>
            <input
              type="text"
              id="search"
              placeholder="Projektnamn, organisation..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
              className="w-full rounded-lg border-0 bg-white/10 px-4 py-2 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-1">
              Kategori
            </label>
            <select
              id="category"
              value={filters.category}
              onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
              className="w-full rounded-lg border-0 bg-white/10 px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Alla kategorier</option>
              {availableCategories.map(cat => (
                <option key={cat} value={cat}>
                  {getCategoryName(cat)}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-slate-300 mb-1">
              Sortera efter
            </label>
            <select
              id="sortBy"
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={e => {
                const [sortBy, sortOrder] = e.target.value.split('-') as [
                  CatalogFilters['sortBy'],
                  CatalogFilters['sortOrder']
                ];
                setFilters(f => ({ ...f, sortBy, sortOrder }));
              }}
              className="w-full rounded-lg border-0 bg-white/10 px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="score-desc">Högst score</option>
              <option value="score-asc">Lägst score</option>
              <option value="name-asc">Namn A-Ö</option>
              <option value="name-desc">Namn Ö-A</option>
              <option value="lastUpdated-desc">Senast uppdaterad</option>
              <option value="lastUpdated-asc">Äldst uppdaterad</option>
            </select>
          </div>

          {/* DIS Fas 1 toggle */}
          <div className="flex items-end">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.disFase1Only}
                onChange={e => setFilters(f => ({ ...f, disFase1Only: e.target.checked }))}
                className="h-5 w-5 rounded border-0 bg-white/10 text-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-300">Endast DIS Fas 1</span>
            </label>
          </div>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-slate-400">
        Visar {filteredRepositories.length} av {initialRepositories.length} projekt
      </div>

      {/* Repository grid */}
      {filteredRepositories.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRepositories.map(repo => (
            <Link
              key={repo.id}
              href={`/catalog/${repo.id}`}
              className="group rounded-xl bg-white/5 p-5 backdrop-blur transition-all hover:bg-white/10"
            >
              {/* Header with score */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white truncate group-hover:text-blue-400 transition-colors">
                    {repo.name}
                  </h3>
                  <p className="text-sm text-slate-400 truncate">{repo.owner}</p>
                </div>
                <div className={`flex-shrink-0 rounded-lg px-2.5 py-1 ${getScoreBg(repo.score)}`}>
                  <span className={`text-lg font-bold ${getScoreColor(repo.score)}`}>
                    {repo.score}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="mt-3 text-sm text-slate-300 line-clamp-2">
                {repo.description || 'Ingen beskrivning'}
              </p>

              {/* Categories */}
              {repo.categories.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {repo.categories.slice(0, 3).map(cat => (
                    <span
                      key={cat}
                      className="inline-flex items-center rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300"
                    >
                      {getCategoryName(cat)}
                    </span>
                  ))}
                  {repo.categories.length > 3 && (
                    <span className="inline-flex items-center rounded-full bg-slate-500/20 px-2 py-0.5 text-xs text-slate-400">
                      +{repo.categories.length - 3}
                    </span>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3">
                  {repo.disFase1 && (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      DIS Fas 1
                    </span>
                  )}
                  <span>{repo.license}</span>
                </div>
                <span>{repo.developmentStatus}</span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="mx-auto h-16 w-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-1">Inga projekt hittades</h3>
          <p className="text-slate-400">
            {initialRepositories.length === 0
              ? 'Katalogen är tom. Registrera ditt projekt med vår GitHub Action!'
              : 'Prova att ändra dina filter för att hitta fler projekt.'}
          </p>
          {initialRepositories.length === 0 && (
            <a
              href="/editor"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Kom igång
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          )}
        </div>
      )}
    </div>
  );
}
