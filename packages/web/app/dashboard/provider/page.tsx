'use client';

import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SERVICE_TYPE_LABELS } from '@/lib/service-types';
import type { ServiceType } from '@/types/organization';

interface Organization {
  id: string;
  name: string;
  slug: string;
  type: string;
  avatarUrl: string;
  description?: string;
  website?: string;
  contactEmail?: string;
  location?: string;
  employeeCount?: string;
  serviceOfferings?: Array<{
    type: ServiceType;
    description?: string;
  }>;
}

interface Project {
  id: string;
  name: string;
  url: string;
  description?: string;
}

const SERVICE_TYPES: ServiceType[] = [
  'support',
  'hosting',
  'development',
  'training',
  'consulting',
  'integration',
  'migration',
];

const EMPLOYEE_COUNTS = [
  { value: '1-10', label: '1-10 anställda' },
  { value: '11-50', label: '11-50 anställda' },
  { value: '51-200', label: '51-200 anställda' },
  { value: '201-500', label: '201-500 anställda' },
  { value: '500+', label: '500+ anställda' },
];

export default function ProviderProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [organization, setOrganization] = useState<Organization | null>(null);

  // Form state
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [location, setLocation] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');
  const [selectedServices, setSelectedServices] = useState<ServiceType[]>([]);

  // Supported projects
  const [supportedProjects, setSupportedProjects] = useState<Project[]>([]);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);
  const [showProjectSearch, setShowProjectSearch] = useState(false);
  const [projectSearch, setProjectSearch] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/register');
    } else if (status === 'authenticated') {
      fetchOrganization();
    }
  }, [status, router]);

  async function fetchOrganization() {
    try {
      const response = await fetch('/api/organizations');
      const data = await response.json();

      if (data.organizations && data.organizations.length > 0) {
        const org = data.organizations[0];
        setOrganization(org);
        setDescription(org.description || '');
        setWebsite(org.website || '');
        setContactEmail(org.contactEmail || '');
        setLocation(org.location || '');
        setEmployeeCount(org.employeeCount || '');
        setSelectedServices(
          org.serviceOfferings?.map((s: { type: ServiceType }) => s.type) || []
        );

        // Fetch supported projects
        fetchSupportedProjects(org.id);
      }
    } catch (err) {
      setError('Kunde inte hämta organisation');
    } finally {
      setLoading(false);
    }
  }

  async function fetchSupportedProjects(orgId: string) {
    try {
      const response = await fetch(`/api/organizations/${orgId}/supported-projects`);
      const data = await response.json();
      if (data.success) {
        setSupportedProjects(data.projects || []);
      }
    } catch {
      // Ignore errors
    }
  }

  async function searchProjects(query: string) {
    if (query.length < 2) {
      setAvailableProjects([]);
      return;
    }

    try {
      const response = await fetch(`/api/registry?search=${encodeURIComponent(query)}&limit=10`);
      const data = await response.json();
      if (data.items) {
        // Filter out already supported projects
        const supportedIds = new Set(supportedProjects.map(p => p.id));
        setAvailableProjects(
          data.items
            .filter((p: Project) => !supportedIds.has(p.id))
            .map((p: any) => ({
              id: p.id,
              name: p.name,
              url: p.url,
              description: p.shortDescription || p.description,
            }))
        );
      }
    } catch {
      // Ignore errors
    }
  }

  async function addSupportedProject(project: Project) {
    if (!organization) return;

    try {
      const response = await fetch(`/api/organizations/${organization.id}/supported-projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          projectName: project.name,
          projectUrl: project.url,
          services: selectedServices,
          experienceLevel: 'intermediate',
        }),
      });

      if (response.ok) {
        setSupportedProjects([...supportedProjects, project]);
        setShowProjectSearch(false);
        setProjectSearch('');
        setAvailableProjects([]);
      }
    } catch {
      setError('Kunde inte lägga till projekt');
    }
  }

  async function removeSupportedProject(projectId: string) {
    if (!organization) return;

    try {
      const response = await fetch(
        `/api/organizations/${organization.id}/supported-projects?projectId=${projectId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        setSupportedProjects(supportedProjects.filter(p => p.id !== projectId));
      }
    } catch {
      setError('Kunde inte ta bort projekt');
    }
  }

  async function saveProfile() {
    if (!organization) return;

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch(`/api/organizations/${organization.id}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'service_provider',
          description,
          website,
          contactEmail,
          location,
          employeeCount,
          serviceOfferings: selectedServices.map(type => ({ type })),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        // Show detailed error info for debugging
        const errorDetails = data.error ? ` (${data.debugStep}: ${data.error})` : '';
        throw new Error((data.message || 'Kunde inte spara profilen') + errorDetails);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod');
    } finally {
      setSaving(false);
    }
  }

  function toggleService(service: ServiceType) {
    if (selectedServices.includes(service)) {
      setSelectedServices(selectedServices.filter(s => s !== service));
    } else {
      setSelectedServices([...selectedServices, service]);
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-32">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="animate-pulse text-white">Laddar...</div>
        </div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-32">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <h1 className="text-2xl font-bold text-white">Ingen organisation hittades</h1>
          <p className="mt-4 text-slate-300">
            Du måste först registrera en organisation.
          </p>
          <Link
            href="/register"
            className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            Registrera organisation
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-16">
      <div className="mx-auto max-w-3xl px-4">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Tillbaka till Dashboard
          </Link>
        </nav>

        <div className="rounded-2xl bg-white/10 p-8 backdrop-blur">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <img
              src={organization.avatarUrl}
              alt={organization.name}
              className="h-16 w-16 rounded-lg"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">Tjänsteleverantörsprofil</h1>
              <p className="text-slate-400">{organization.name}</p>
            </div>
          </div>

          {/* Success message */}
          {success && (
            <div className="mb-6 rounded-lg bg-green-500/20 p-4 text-green-200">
              Profilen har sparats!
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-6 rounded-lg bg-red-500/20 p-4 text-red-200">
              {error}
            </div>
          )}

          {/* Basic info */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Grundläggande information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Beskrivning
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Beskriv ditt företag och vad ni erbjuder..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Webbplats
                  </label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Kontaktepost
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="kontakt@example.com"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Plats
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Stockholm"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Antal anställda
                  </label>
                  <select
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(e.target.value)}
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Välj...</option>
                    {EMPLOYEE_COUNTS.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Services */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Tjänster ni erbjuder</h2>
            <p className="text-sm text-slate-400 mb-4">
              Välj vilka typer av tjänster ert företag erbjuder.
            </p>
            <div className="flex flex-wrap gap-2">
              {SERVICE_TYPES.map((service) => (
                <button
                  key={service}
                  onClick={() => toggleService(service)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    selectedServices.includes(service)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-slate-300 hover:bg-white/20'
                  }`}
                >
                  {SERVICE_TYPE_LABELS[service]}
                </button>
              ))}
            </div>
          </section>

          {/* Supported projects */}
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-white mb-4">Projekt ni stödjer</h2>
            <p className="text-sm text-slate-400 mb-4">
              Lägg till projekt från katalogen som ni har expertis inom och kan erbjuda tjänster för.
            </p>

            {supportedProjects.length > 0 && (
              <div className="space-y-2 mb-4">
                {supportedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between rounded-lg bg-white/5 p-3"
                  >
                    <div>
                      <div className="font-medium text-white">{project.name}</div>
                      {project.description && (
                        <div className="text-sm text-slate-400 line-clamp-1">
                          {project.description}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeSupportedProject(project.id)}
                      className="text-red-400 hover:text-red-300 p-2"
                      title="Ta bort"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {showProjectSearch ? (
              <div className="rounded-lg bg-white/5 p-4">
                <input
                  type="text"
                  value={projectSearch}
                  onChange={(e) => {
                    setProjectSearch(e.target.value);
                    searchProjects(e.target.value);
                  }}
                  placeholder="Sök efter projekt..."
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  autoFocus
                />

                {availableProjects.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {availableProjects.map((project) => (
                      <button
                        key={project.id}
                        onClick={() => addSupportedProject(project)}
                        className="w-full text-left rounded-lg p-3 hover:bg-white/10 transition-colors"
                      >
                        <div className="font-medium text-white">{project.name}</div>
                        {project.description && (
                          <div className="text-sm text-slate-400 line-clamp-1">
                            {project.description}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => {
                    setShowProjectSearch(false);
                    setProjectSearch('');
                    setAvailableProjects([]);
                  }}
                  className="mt-3 text-sm text-slate-400 hover:text-white"
                >
                  Avbryt
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowProjectSearch(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Lägg till projekt
              </button>
            )}
          </section>

          {/* Save button */}
          <div className="flex justify-end gap-4">
            <Link
              href="/dashboard"
              className="rounded-lg bg-white/10 px-6 py-3 font-medium text-white hover:bg-white/20 transition-colors"
            >
              Avbryt
            </Link>
            <button
              onClick={saveProfile}
              disabled={saving}
              className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Sparar...' : 'Spara profil'}
            </button>
          </div>
        </div>

        {/* Info box */}
        <div className="mt-6 rounded-xl bg-blue-500/10 border border-blue-500/20 p-6">
          <h3 className="font-semibold text-blue-300 mb-2">Vad händer sedan?</h3>
          <p className="text-sm text-slate-300">
            Efter att du sparat din profil kommer ditt företag att synas på{' '}
            <Link href="/leverantorer" className="text-blue-400 hover:underline">
              leverantörssidan
            </Link>{' '}
            och på detaljsidorna för de projekt du stödjer. Kommuner och myndigheter
            kan då hitta er när de söker hjälp med öppna källkodsprojekt.
          </p>
        </div>
      </div>
    </div>
  );
}
