'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SERVICE_TYPE_LABELS, EXPERIENCE_LEVEL_LABELS } from '@/lib/service-types';
import type { ServiceType } from '@/types/organization';

interface Provider {
  id: string;
  name: string;
  slug: string;
  avatarUrl: string;
  description?: string;
  location?: string;
  services: ServiceType[];
  experienceLevel: string;
  deployments?: number;
  supportDescription?: string;
}

interface ProjectProvidersProps {
  projectId: string;
}

export default function ProjectProviders({ projectId }: ProjectProvidersProps) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProviders() {
      try {
        const response = await fetch(`/api/projects/${projectId}/providers`);
        const data = await response.json();

        if (data.success) {
          setProviders(data.providers);
        } else {
          setError(data.message || 'Kunde inte hämta leverantörer');
        }
      } catch (err) {
        setError('Ett fel uppstod');
      } finally {
        setLoading(false);
      }
    }

    fetchProviders();
  }, [projectId]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white/5 p-6 backdrop-blur">
        <h2 className="text-xl font-semibold text-white mb-4">Tjänsteleverantörer</h2>
        <div className="animate-pulse space-y-3">
          <div className="h-20 bg-white/10 rounded-lg"></div>
          <div className="h-20 bg-white/10 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return null; // Silently fail - don't show section if error
  }

  if (providers.length === 0) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-6">
        <h2 className="text-xl font-semibold text-white mb-3">Behöver du hjälp?</h2>
        <p className="text-slate-300 mb-4">
          Det finns ännu inga registrerade leverantörer som stödjer detta projekt.
          Om du erbjuder tjänster för detta projekt kan du registrera din organisation.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 rounded-lg bg-amber-500/20 px-4 py-2 font-medium text-amber-300 hover:bg-amber-500/30 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Bli leverantör
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/5 p-6 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Tjänsteleverantörer</h2>
        <span className="text-sm text-slate-400">{providers.length} leverantör{providers.length !== 1 ? 'er' : ''}</span>
      </div>

      <p className="text-sm text-slate-400 mb-4">
        Dessa organisationer erbjuder stöd och tjänster för detta projekt.
      </p>

      <div className="space-y-3">
        {providers.map((provider) => (
          <div
            key={provider.id}
            className="rounded-xl bg-white/5 p-4 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start gap-4">
              {provider.avatarUrl ? (
                <img
                  src={provider.avatarUrl}
                  alt={provider.name}
                  className="h-12 w-12 rounded-lg"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-700 text-lg font-medium text-white">
                  {provider.name.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/organisationer/${provider.slug}`}
                    className="font-semibold text-white hover:text-blue-400 transition-colors"
                  >
                    {provider.name}
                  </Link>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    provider.experienceLevel === 'expert'
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : provider.experienceLevel === 'intermediate'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-slate-500/20 text-slate-400'
                  }`}>
                    {EXPERIENCE_LEVEL_LABELS[provider.experienceLevel as keyof typeof EXPERIENCE_LEVEL_LABELS] || provider.experienceLevel}
                  </span>
                  {provider.deployments && provider.deployments > 0 && (
                    <span className="text-xs text-slate-500">
                      {provider.deployments} installationer
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
                  </p>
                )}

                {provider.supportDescription && (
                  <p className="text-sm text-slate-300 mt-2">{provider.supportDescription}</p>
                )}

                {/* Services */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {provider.services.map((service) => (
                    <span
                      key={service}
                      className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-0.5 text-xs text-blue-300"
                    >
                      {SERVICE_TYPE_LABELS[service] || service}
                    </span>
                  ))}
                </div>
              </div>

              {/* Contact button */}
              <Link
                href={`/organisationer/${provider.slug}?kontakt=true`}
                className="shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Kontakta
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <Link
          href="/leverantorer"
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          Se alla leverantörer &rarr;
        </Link>
      </div>
    </div>
  );
}
