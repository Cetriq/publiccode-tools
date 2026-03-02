'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
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

interface UserOrganization {
  id: string;
  name: string;
  slug: string;
  avatarUrl?: string;
  type?: string;
}

interface ProjectProvidersProps {
  projectId: string;
}

const SERVICE_OPTIONS: { value: ServiceType; label: string }[] = [
  { value: 'support', label: 'Support' },
  { value: 'hosting', label: 'Hosting' },
  { value: 'development', label: 'Utveckling' },
  { value: 'training', label: 'Utbildning' },
  { value: 'consulting', label: 'Konsulttjänster' },
  { value: 'integration', label: 'Integration' },
  { value: 'migration', label: 'Migrering' },
];

const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'Nybörjare' },
  { value: 'intermediate', label: 'Mellannivå' },
  { value: 'expert', label: 'Expert' },
];

export default function ProjectProviders({ projectId }: ProjectProvidersProps) {
  const { data: session, status } = useSession();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState<'select-org' | 'configure'>('select-org');
  const [userOrgs, setUserOrgs] = useState<UserOrganization[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<UserOrganization | null>(null);

  // Form state
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'expert'>('intermediate');
  const [deployments, setDeployments] = useState<number>(0);
  const [description, setDescription] = useState('');

  const [registering, setRegistering] = useState(false);
  const [registerResult, setRegisterResult] = useState<{ success: boolean; message: string } | null>(null);

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

  // Fetch user's organizations when modal opens
  useEffect(() => {
    async function fetchUserOrgs() {
      if (!showModal || !session?.user?.id) return;

      setLoadingOrgs(true);
      try {
        const response = await fetch('/api/organizations');
        const data = await response.json();

        if (data.success) {
          // Filter to only service providers and filter out orgs already providing for this project
          const providerIds = providers.map(p => p.id);
          const availableOrgs = (data.organizations || []).filter(
            (org: UserOrganization) =>
              !providerIds.includes(org.id) &&
              (org.type === 'service_provider' || org.type === 'developer')
          );
          setUserOrgs(availableOrgs);
        }
      } catch (err) {
        console.error('Failed to fetch user orgs:', err);
      } finally {
        setLoadingOrgs(false);
      }
    }

    fetchUserOrgs();
  }, [showModal, session?.user?.id, providers]);

  const handleSelectOrg = (org: UserOrganization) => {
    setSelectedOrg(org);
    setModalStep('configure');
  };

  const toggleService = (service: ServiceType) => {
    setSelectedServices(prev =>
      prev.includes(service)
        ? prev.filter(s => s !== service)
        : [...prev, service]
    );
  };

  const handleRegister = async () => {
    if (!selectedOrg || selectedServices.length === 0) return;

    setRegistering(true);
    setRegisterResult(null);

    try {
      const response = await fetch(`/api/organizations/${selectedOrg.id}/supported-projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          services: selectedServices,
          experienceLevel,
          deployments: deployments > 0 ? deployments : undefined,
          description: description.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRegisterResult({ success: true, message: 'Din organisation har registrerats som leverantör!' });
        // Refresh providers list
        const providersResponse = await fetch(`/api/projects/${projectId}/providers`);
        const providersData = await providersResponse.json();
        if (providersData.success) {
          setProviders(providersData.providers);
        }
        // Close modal after short delay
        setTimeout(() => {
          setShowModal(false);
          resetModal();
        }, 2000);
      } else {
        setRegisterResult({ success: false, message: data.message || 'Kunde inte registrera' });
      }
    } catch (err) {
      setRegisterResult({ success: false, message: 'Ett fel uppstod' });
    } finally {
      setRegistering(false);
    }
  };

  const resetModal = () => {
    setModalStep('select-org');
    setSelectedOrg(null);
    setSelectedServices([]);
    setExperienceLevel('intermediate');
    setDeployments(0);
    setDescription('');
    setRegisterResult(null);
  };

  const handleProviderClick = () => {
    if (status !== 'authenticated') {
      window.location.href = '/register';
      return;
    }
    resetModal();
    setShowModal(true);
  };

  // Modal component
  const ProviderModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
        <div className="relative w-full max-w-lg rounded-2xl bg-slate-800 border border-slate-700 p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          <button
            onClick={() => setShowModal(false)}
            className="absolute right-4 top-4 text-slate-400 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {registerResult ? (
            <div className={`rounded-lg p-4 ${registerResult.success ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
              {registerResult.message}
            </div>
          ) : modalStep === 'select-org' ? (
            <>
              <h3 className="text-lg font-semibold text-white mb-4">Välj organisation</h3>

              {loadingOrgs ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-12 bg-white/10 rounded-lg"></div>
                  <div className="h-12 bg-white/10 rounded-lg"></div>
                </div>
              ) : userOrgs.length === 0 ? (
                <div className="text-slate-300">
                  <p className="mb-4">
                    Du har inga leverantörsorganisationer att registrera, eller alla dina organisationer erbjuder redan tjänster för detta projekt.
                  </p>
                  <p className="text-sm text-slate-400 mb-4">
                    För att bli leverantör behöver du en organisation av typen "Tjänsteleverantör" eller "Utvecklare".
                  </p>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300"
                  >
                    Registrera en organisation
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-slate-400 mb-4">
                    Välj vilken organisation som ska registreras som leverantör för detta projekt:
                  </p>
                  {userOrgs.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => handleSelectOrg(org)}
                      className="w-full flex items-center gap-3 rounded-lg bg-white/5 p-3 hover:bg-white/10 transition-colors text-left"
                    >
                      {org.avatarUrl ? (
                        <img src={org.avatarUrl} alt={org.name} className="h-10 w-10 rounded" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-700 text-lg font-medium text-white">
                          {org.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-medium text-white">{org.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => setModalStep('select-org')}
                className="flex items-center gap-1 text-sm text-slate-400 hover:text-white mb-4"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Tillbaka
              </button>

              <div className="flex items-center gap-3 mb-6">
                {selectedOrg?.avatarUrl ? (
                  <img src={selectedOrg.avatarUrl} alt={selectedOrg.name} className="h-10 w-10 rounded" />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-700 text-lg font-medium text-white">
                    {selectedOrg?.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <h3 className="text-lg font-semibold text-white">{selectedOrg?.name}</h3>
              </div>

              {/* Services */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Vilka tjänster erbjuder ni? *
                </label>
                <div className="flex flex-wrap gap-2">
                  {SERVICE_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => toggleService(value)}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                        selectedServices.includes(value)
                          ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                          : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {selectedServices.length === 0 && (
                  <p className="mt-2 text-xs text-red-400">Välj minst en tjänst</p>
                )}
              </div>

              {/* Experience Level */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Erfarenhetsnivå
                </label>
                <div className="flex gap-2">
                  {EXPERIENCE_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => setExperienceLevel(value as typeof experienceLevel)}
                      className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                        experienceLevel === value
                          ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50'
                          : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deployments */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Antal installationer (valfritt)
                </label>
                <input
                  type="number"
                  min="0"
                  value={deployments}
                  onChange={(e) => setDeployments(parseInt(e.target.value) || 0)}
                  className="w-full rounded-lg bg-white/5 border border-slate-600 px-3 py-2 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                  placeholder="0"
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Beskriv ert stöd (valfritt)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={500}
                  rows={3}
                  className="w-full rounded-lg bg-white/5 border border-slate-600 px-3 py-2 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none resize-none"
                  placeholder="T.ex. 'Vi har implementerat detta system för 5 kommuner och erbjuder 24/7 support.'"
                />
              </div>

              {/* Submit */}
              <button
                onClick={handleRegister}
                disabled={registering || selectedServices.length === 0}
                className="w-full rounded-lg bg-amber-500 px-4 py-3 font-semibold text-white hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {registering ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Registrerar...
                  </span>
                ) : (
                  'Registrera som leverantör'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

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
      <>
        <ProviderModal />
        <div className="rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20 p-6">
          <h2 className="text-xl font-semibold text-white mb-3">Behöver du hjälp?</h2>
          <p className="text-slate-300 mb-4">
            Det finns ännu inga registrerade leverantörer som stödjer detta projekt.
            Om du erbjuder tjänster för detta projekt kan du registrera din organisation.
          </p>
          <button
            onClick={handleProviderClick}
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500/20 px-4 py-2 font-medium text-amber-300 hover:bg-amber-500/30 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Bli leverantör
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <ProviderModal />
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

        <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
          <Link
            href="/leverantorer"
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            Se alla leverantörer &rarr;
          </Link>
          <button
            onClick={handleProviderClick}
            className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
          >
            Bli leverantör
          </button>
        </div>
      </div>
    </>
  );
}
