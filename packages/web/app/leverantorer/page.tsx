'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SERVICE_TYPE_LABELS } from '@/lib/service-types';
import type { ServiceType } from '@/types/organization';

interface Provider {
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

interface Filters {
  locations: string[];
  serviceTypes: ServiceType[];
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filters, setFilters] = useState<Filters>({ locations: [], serviceTypes: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [selectedServiceType, setSelectedServiceType] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    fetchProviders();
  }, [selectedServiceType, selectedLocation, searchQuery]);

  async function fetchProviders() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedServiceType) params.set('serviceType', selectedServiceType);
      if (selectedLocation) params.set('location', selectedLocation);
      if (searchQuery) params.set('search', searchQuery);

      const response = await fetch(`/api/providers?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setProviders(data.providers);
        setFilters(data.filters);
      } else {
        setError(data.message || 'Kunde inte hämta leverantörer');
      }
    } catch (err) {
      setError('Ett fel uppstod');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Tjänsteleverantörer
            </h1>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              Hitta konsulter och företag som kan hjälpa dig med installation, support,
              utveckling och utbildning för öppna källkodsprojekt.
            </p>
          </div>

          {/* Filters */}
          <div className="rounded-2xl bg-white/5 p-6 backdrop-blur mb-8">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Search */}
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-slate-400 mb-2">
                  Sök
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Sök på namn eller beskrivning..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Service Type */}
              <div>
                <label htmlFor="serviceType" className="block text-sm font-medium text-slate-400 mb-2">
                  Tjänstetyp
                </label>
                <select
                  id="serviceType"
                  value={selectedServiceType}
                  onChange={(e) => setSelectedServiceType(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Alla tjänster</option>
                  {filters.serviceTypes.map((type) => (
                    <option key={type} value={type}>
                      {SERVICE_TYPE_LABELS[type] || type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-slate-400 mb-2">
                  Plats
                </label>
                <select
                  id="location"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">Alla platser</option>
                  {filters.locations.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-slate-400">
              {loading ? 'Laddar...' : `${providers.length} leverantör${providers.length !== 1 ? 'er' : ''}`}
            </p>
            {(selectedServiceType || selectedLocation || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedServiceType('');
                  setSelectedLocation('');
                  setSearchQuery('');
                }}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Rensa filter
              </button>
            )}
          </div>

          {/* Error state */}
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-6 text-center mb-8">
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl bg-white/5 p-6 animate-pulse">
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-lg bg-white/10"></div>
                    <div className="flex-1">
                      <div className="h-6 w-1/3 bg-white/10 rounded mb-2"></div>
                      <div className="h-4 w-full bg-white/10 rounded mb-2"></div>
                      <div className="h-4 w-2/3 bg-white/10 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && providers.length === 0 && (
            <div className="rounded-xl bg-white/5 p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-white">Inga leverantörer hittades</h3>
              <p className="mt-2 text-slate-400">
                {selectedServiceType || selectedLocation || searchQuery
                  ? 'Prova att ändra dina sökkriterier.'
                  : 'Det finns inga registrerade leverantörer ännu.'}
              </p>
              <Link
                href="/register"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Bli leverantör
              </Link>
            </div>
          )}

          {/* Provider cards */}
          {!loading && !error && providers.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {providers.map((provider) => (
                <Link
                  key={provider.id}
                  href={`/organisationer/${provider.slug}`}
                  className="group rounded-xl bg-white/5 p-6 backdrop-blur hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {provider.avatarUrl ? (
                      <img
                        src={provider.avatarUrl}
                        alt={provider.name}
                        className="h-16 w-16 rounded-lg"
                      />
                    ) : (
                      <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-700 text-2xl font-bold text-white">
                        {provider.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {provider.name}
                        </h3>
                        {provider.verified && (
                          <span className="shrink-0" title="Verifierad">
                            <svg className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                              <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </div>

                      {provider.location && (
                        <p className="text-sm text-slate-400 mt-0.5">
                          <svg className="inline-block h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {provider.location}
                          {provider.employeeCount && (
                            <span className="ml-2 text-slate-500">• {provider.employeeCount}</span>
                          )}
                        </p>
                      )}

                      {provider.description && (
                        <p className="text-sm text-slate-300 mt-2 line-clamp-2">
                          {provider.description}
                        </p>
                      )}

                      {/* Service types */}
                      {provider.serviceTypes.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {provider.serviceTypes.slice(0, 4).map((type) => (
                            <span
                              key={type}
                              className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-300"
                            >
                              {SERVICE_TYPE_LABELS[type] || type}
                            </span>
                          ))}
                          {provider.serviceTypes.length > 4 && (
                            <span className="inline-flex items-center rounded-full bg-slate-500/20 px-2 py-0.5 text-xs text-slate-400">
                              +{provider.serviceTypes.length - 4}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Stats */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                        {provider.supportedProjectCount > 0 && (
                          <span>{provider.supportedProjectCount} projekt</span>
                        )}
                        {provider.certificationCount > 0 && (
                          <span>{provider.certificationCount} certifieringar</span>
                        )}
                        {provider.referenceCustomerCount > 0 && (
                          <span>{provider.referenceCustomerCount} referenskunder</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* CTA for providers */}
          <div className="mt-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-3">
              Erbjuder du tjänster för öppen källkod?
            </h2>
            <p className="text-slate-300 mb-6 max-w-xl mx-auto">
              Registrera din organisation och nå kommuner och myndigheter som letar efter
              stöd med implementation, utveckling och underhåll.
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Registrera som leverantör
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
