'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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
}

interface Stats {
  total: number;
  verified: number;
  pending: number;
  byType: Record<string, number>;
}

const ORG_TYPE_LABELS: Record<OrgType, string> = {
  developer: 'Utvecklare',
  service_provider: 'Tjänsteleverantör',
  municipality: 'Kommun',
  public_sector: 'Offentlig sektor',
  other: 'Övrig',
};

export default function AdminOrganizationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all');
  const [typeFilter, setTypeFilter] = useState<OrgType | 'all'>('all');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/register');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrganizations();
    }
  }, [status]);

  async function fetchOrganizations() {
    try {
      const response = await fetch('/api/admin/organizations');
      const data = await response.json();

      if (response.status === 403) {
        setError('Du har inte behörighet att se denna sida');
        return;
      }

      if (data.success) {
        setOrganizations(data.organizations);
        setStats(data.stats);
      } else {
        setError(data.message || 'Kunde inte hämta organisationer');
      }
    } catch (err) {
      setError('Kunde inte hämta organisationer');
    } finally {
      setLoading(false);
    }
  }

  async function toggleVerification(orgId: string, currentStatus: boolean) {
    setUpdating(orgId);
    try {
      const response = await fetch('/api/admin/organizations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId,
          verified: !currentStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOrganizations((orgs) =>
          orgs.map((org) =>
            org.id === orgId ? { ...org, verified: !currentStatus } : org
          )
        );
        // Update stats
        if (stats) {
          setStats({
            ...stats,
            verified: currentStatus ? stats.verified - 1 : stats.verified + 1,
            pending: currentStatus ? stats.pending + 1 : stats.pending - 1,
          });
        }
      } else {
        alert(data.message || 'Kunde inte uppdatera');
      }
    } catch (err) {
      alert('Ett fel uppstod');
    } finally {
      setUpdating(null);
    }
  }

  // Filter organizations
  const filteredOrgs = organizations.filter((org) => {
    if (filter === 'pending' && org.verified) return false;
    if (filter === 'verified' && !org.verified) return false;
    if (typeFilter !== 'all' && org.type !== typeFilter) return false;
    return true;
  });

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-32">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="animate-pulse text-white">Laddar...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-32">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="text-red-400">{error}</div>
          <Link href="/dashboard" className="mt-4 inline-block text-blue-400 hover:underline">
            Tillbaka till Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-32 pb-16">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="mb-4 inline-flex items-center text-slate-400 hover:text-white"
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Tillbaka
          </Link>
          <h1 className="text-3xl font-bold text-white">Organisationer</h1>
          <p className="mt-2 text-slate-400">Hantera och verifiera organisationer</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="mb-8 grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
              <div className="text-3xl font-bold text-white">{stats.total}</div>
              <div className="text-sm text-slate-400">Totalt</div>
            </div>
            <div className="rounded-xl bg-green-500/20 p-4">
              <div className="text-3xl font-bold text-green-300">{stats.verified}</div>
              <div className="text-sm text-green-200/70">Verifierade</div>
            </div>
            <div className="rounded-xl bg-yellow-500/20 p-4">
              <div className="text-3xl font-bold text-yellow-300">{stats.pending}</div>
              <div className="text-sm text-yellow-200/70">Väntar</div>
            </div>
            <div className="rounded-xl bg-blue-500/20 p-4">
              <div className="text-3xl font-bold text-blue-300">{stats.byType.service_provider || 0}</div>
              <div className="text-sm text-blue-200/70">Tjänsteleverantörer</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex rounded-lg bg-white/10 p-1">
            {(['all', 'pending', 'verified'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition ${
                  filter === f
                    ? 'bg-blue-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {f === 'all' ? 'Alla' : f === 'pending' ? 'Väntar' : 'Verifierade'}
              </button>
            ))}
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as OrgType | 'all')}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-blue-500 focus:outline-none"
          >
            <option value="all">Alla typer</option>
            {Object.entries(ORG_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Verification Checklist */}
        <div className="mb-8 rounded-xl bg-amber-500/10 border border-amber-500/20 p-6">
          <h3 className="font-semibold text-amber-300 mb-3 flex items-center gap-2">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Checklista innan verifiering
          </h3>
          <ul className="text-sm text-slate-300 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">1.</span>
              <span><strong>Kolla GitHub-profilen</strong> - Är organisationen legitim? Har den en beskrivning, webbplats och profilbild?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">2.</span>
              <span><strong>Verifiera organisationstyp</strong> - Stämmer angiven typ (kommun, tjänsteleverantör, etc.) med verkligheten?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">3.</span>
              <span><strong>Granska repositories</strong> - Har de faktiska publiccode.yml-filer? Är projekten relevanta för offentlig sektor?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">4.</span>
              <span><strong>Kolla webbplats</strong> - Om de har en webbplats, verifiera att det är ett seriöst företag/organisation</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">5.</span>
              <span><strong>Kontrollera kontaktinfo</strong> - Finns det sätt att kontakta organisationen vid behov?</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5">6.</span>
              <span><strong>Undvik spam/fake</strong> - Inga tomma profiler, inga uppenbara fake-konton, inga organisationer utan aktivitet</span>
            </li>
          </ul>
        </div>

        {/* Organizations list */}
        <div className="space-y-3">
          {filteredOrgs.length === 0 ? (
            <div className="rounded-xl bg-white/10 p-8 text-center backdrop-blur">
              <p className="text-slate-400">Inga organisationer matchar filtret</p>
            </div>
          ) : (
            filteredOrgs.map((org) => (
              <div
                key={org.id}
                className="rounded-xl bg-white/10 p-4 backdrop-blur"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={org.avatarUrl}
                    alt={org.name}
                    className="h-12 w-12 rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-white">{org.name}</h3>
                      <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300">
                        {ORG_TYPE_LABELS[org.type]}
                      </span>
                      {org.verified ? (
                        <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs text-green-300">
                          Verifierad
                        </span>
                      ) : (
                        <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-300">
                          Ej verifierad
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                      <span>{org.repoCount} repos</span>
                      {org.createdAt && (
                        <span>
                          Registrerad {new Date(org.createdAt).toLocaleDateString('sv-SE')}
                        </span>
                      )}
                    </div>
                    {org.capabilities && org.capabilities.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {org.capabilities.map((cap) => (
                          <span
                            key={cap}
                            className="rounded bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://github.com/${org.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white"
                      title="Se på GitHub"
                    >
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                    </a>
                    <button
                      onClick={() => toggleVerification(org.id, org.verified)}
                      disabled={updating === org.id}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                        org.verified
                          ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                          : 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                      } disabled:opacity-50`}
                    >
                      {updating === org.id
                        ? 'Sparar...'
                        : org.verified
                        ? 'Ta bort verifiering'
                        : 'Verifiera'}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
