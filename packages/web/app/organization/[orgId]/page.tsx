'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type OrgType = 'developer' | 'service_provider' | 'municipality' | 'public_sector' | 'other';

interface Organization {
  id: string;
  name: string;
  slug: string;
  type: OrgType;
  verified: boolean;
  avatarUrl: string;
  repoCount: number;
  capabilities: string[];
  createdAt: string | null;
  updatedAt: string | null;
  canManage: boolean;
}

const ORG_TYPES: { value: OrgType; label: string; description: string }[] = [
  { value: 'developer', label: 'Utvecklare', description: 'Utvecklar och underhåller open source-projekt' },
  { value: 'service_provider', label: 'Tjänsteleverantör', description: 'Erbjuder support, hosting eller utvecklingstjänster' },
  { value: 'municipality', label: 'Kommun', description: 'Svensk kommun som använder eller utvecklar öppna lösningar' },
  { value: 'public_sector', label: 'Offentlig sektor', description: 'Myndighet eller annan offentlig organisation' },
  { value: 'other', label: 'Övrig', description: 'Annan typ av organisation' },
];

const CAPABILITY_SUGGESTIONS = [
  'Support',
  'Hosting',
  'Utveckling',
  'Utbildning',
  'Konsulting',
  'Integration',
  'Drift',
  'Migrering',
];

export default function OrganizationPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const orgId = params.orgId as string;

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form state
  const [selectedType, setSelectedType] = useState<OrgType>('developer');
  const [capabilities, setCapabilities] = useState<string[]>([]);
  const [newCapability, setNewCapability] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/register');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && orgId) {
      fetchOrganization();
    }
  }, [status, orgId]);

  async function fetchOrganization() {
    try {
      const response = await fetch(`/api/organizations/${orgId}`);
      const data = await response.json();

      if (data.success) {
        setOrganization(data.organization);
        setSelectedType(data.organization.type);
        setCapabilities(data.organization.capabilities || []);
      } else {
        setError(data.message || 'Kunde inte hamta organisation');
      }
    } catch (err) {
      setError('Kunde inte hamta organisation');
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!organization?.canManage) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/organizations/${orgId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          capabilities,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Organisationen har uppdaterats');
        setOrganization((prev) => prev ? { ...prev, type: selectedType, capabilities } : null);
      } else {
        setError(data.message || 'Kunde inte spara');
      }
    } catch (err) {
      setError('Ett fel uppstod');
    } finally {
      setSaving(false);
    }
  }

  function addCapability(cap: string) {
    const trimmed = cap.trim();
    if (trimmed && !capabilities.includes(trimmed) && capabilities.length < 10) {
      setCapabilities([...capabilities, trimmed]);
      setNewCapability('');
    }
  }

  function removeCapability(cap: string) {
    setCapabilities(capabilities.filter((c) => c !== cap));
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-32">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <div className="animate-pulse text-white">Laddar...</div>
        </div>
      </div>
    );
  }

  if (!session || !organization) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-32">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <div className="text-red-400">{error || 'Organisation hittades inte'}</div>
          <Link href="/dashboard" className="mt-4 inline-block text-blue-400 hover:underline">
            Tillbaka till Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-32 pb-16">
      <div className="mx-auto max-w-2xl px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="mb-4 inline-flex items-center text-slate-400 hover:text-white"
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Tillbaka till Dashboard
          </Link>

          <div className="flex items-center gap-4">
            <img
              src={organization.avatarUrl}
              alt={organization.name}
              className="h-16 w-16 rounded-xl"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">{organization.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                {organization.verified ? (
                  <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-0.5 text-xs font-medium text-green-300">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Verifierad
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded-full bg-yellow-500/20 px-3 py-0.5 text-xs font-medium text-yellow-300">
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Ej verifierad
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-500/20 p-4 text-red-200">{error}</div>
        )}
        {success && (
          <div className="mb-6 rounded-lg bg-green-500/20 p-4 text-green-200">{success}</div>
        )}

        {/* Organization Type */}
        <div className="mb-8 rounded-2xl bg-white/10 p-6 backdrop-blur">
          <h2 className="mb-4 text-lg font-semibold text-white">Organisationstyp</h2>
          <p className="mb-4 text-sm text-slate-400">
            Valj den typ som bast beskriver din organisation. Detta hjalper kommuner att hitta ratt leverantorer.
          </p>

          <div className="space-y-3">
            {ORG_TYPES.map((type) => (
              <label
                key={type.value}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition ${
                  selectedType === type.value
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-white/10 bg-white/5 hover:border-white/20'
                } ${!organization.canManage ? 'cursor-not-allowed opacity-60' : ''}`}
              >
                <input
                  type="radio"
                  name="orgType"
                  value={type.value}
                  checked={selectedType === type.value}
                  onChange={(e) => setSelectedType(e.target.value as OrgType)}
                  disabled={!organization.canManage}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium text-white">{type.label}</div>
                  <div className="text-sm text-slate-400">{type.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Capabilities (only for service providers) */}
        {selectedType === 'service_provider' && (
          <div className="mb-8 rounded-2xl bg-white/10 p-6 backdrop-blur">
            <h2 className="mb-4 text-lg font-semibold text-white">Tjänster ni erbjuder</h2>
            <p className="mb-4 text-sm text-slate-400">
              Lägg till de tjänster ni erbjuder för öppna lösningar (max 10 st).
            </p>

            {/* Current capabilities */}
            <div className="mb-4 flex flex-wrap gap-2">
              {capabilities.map((cap) => (
                <span
                  key={cap}
                  className="flex items-center gap-1 rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-300"
                >
                  {cap}
                  {organization.canManage && (
                    <button
                      onClick={() => removeCapability(cap)}
                      className="ml-1 text-blue-300 hover:text-white"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </span>
              ))}
              {capabilities.length === 0 && (
                <span className="text-sm text-slate-500">Inga tjänster tillagda ännu</span>
              )}
            </div>

            {/* Add capability */}
            {organization.canManage && capabilities.length < 10 && (
              <>
                <div className="mb-3 flex gap-2">
                  <input
                    type="text"
                    value={newCapability}
                    onChange={(e) => setNewCapability(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCapability(newCapability);
                      }
                    }}
                    placeholder="Lägg till tjänst..."
                    className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    onClick={() => addCapability(newCapability)}
                    className="rounded-lg bg-blue-500 px-4 py-2 font-medium text-white hover:bg-blue-600"
                  >
                    Lägg till
                  </button>
                </div>

                {/* Suggestions */}
                <div className="flex flex-wrap gap-2">
                  {CAPABILITY_SUGGESTIONS.filter((s) => !capabilities.includes(s)).map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => addCapability(suggestion)}
                      className="rounded-full border border-white/10 px-3 py-1 text-sm text-slate-400 hover:border-blue-500 hover:text-blue-300"
                    >
                      + {suggestion}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* Save button */}
        {organization.canManage && (
          <div className="flex justify-end gap-4">
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/10 px-6 py-3 font-semibold text-white transition hover:border-white/20"
            >
              Avbryt
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? 'Sparar...' : 'Spara ändringar'}
            </button>
          </div>
        )}

        {!organization.canManage && (
          <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4 text-center">
            <p className="text-yellow-300">
              Du har inte behörighet att redigera denna organisation.
              Kontakta en ägare för att få tillgång.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
