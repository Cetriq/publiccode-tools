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

const ORG_TYPE_LABELS: Record<OrgType, string> = {
  developer: 'Utvecklare',
  service_provider: 'Tjänsteleverantör',
  municipality: 'Kommun',
  public_sector: 'Offentlig sektor',
  other: 'Övrig',
};

interface MyRepo {
  id: string;
  name: string;
  url: string;
  description: string;
  score: number;
  categories: string[];
  disFase1: boolean;
  registeredAt: string;
  lastUpdated: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [myRepos, setMyRepos] = useState<MyRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [reposLoading, setReposLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/register');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchOrganizations();
      fetchMyRepos();
    }
  }, [status]);

  async function fetchOrganizations() {
    try {
      const response = await fetch('/api/organizations');
      const data = await response.json();

      if (data.success) {
        setOrganizations(data.organizations);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Kunde inte hämta organisationer');
    } finally {
      setLoading(false);
    }
  }

  async function fetchMyRepos() {
    try {
      const response = await fetch('/api/repos/my');
      const data = await response.json();

      if (data.success) {
        setMyRepos(data.repos);
      }
    } catch (err) {
      console.error('Could not fetch my repos:', err);
    } finally {
      setReposLoading(false);
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-32">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="animate-pulse text-white">Laddar...</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-32 pb-16">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
            <p className="mt-2 text-slate-300">
              Hantera dina organisationer och API-nycklar
            </p>
          </div>
          <Link
            href="/register"
            className="rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white transition hover:bg-blue-600"
          >
            + Lägg till organisation
          </Link>
        </div>

        {error && (
          <div className="mb-6 rounded-lg bg-red-500/20 p-4 text-red-200">
            {error}
          </div>
        )}

        {/* My Repos Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-xl font-semibold text-white">
            Mina registrerade repos
          </h2>
          {reposLoading ? (
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur">
              <div className="animate-pulse text-slate-400">Laddar repos...</div>
            </div>
          ) : myRepos.length === 0 ? (
            <div className="rounded-2xl bg-white/10 p-6 backdrop-blur text-center">
              <p className="text-slate-400">
                Du har inte registrerat några repos än.{' '}
                <Link href="/register" className="text-blue-400 hover:underline">
                  Registrera ditt första projekt
                </Link>
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {myRepos.map((repo) => (
                <Link
                  key={repo.id}
                  href={`/catalog/${repo.id}`}
                  className="block rounded-xl bg-white/10 p-4 backdrop-blur transition hover:bg-white/15"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white truncate">
                          {repo.name}
                        </h3>
                        {repo.disFase1 && (
                          <span className="shrink-0 rounded bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-300">
                            DIS Fas 1
                          </span>
                        )}
                      </div>
                      {repo.description && (
                        <p className="mt-1 text-sm text-slate-400 line-clamp-1">
                          {repo.description}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {repo.categories.slice(0, 3).map((cat) => (
                          <span
                            key={cat}
                            className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-300"
                          >
                            {cat}
                          </span>
                        ))}
                        {repo.categories.length > 3 && (
                          <span className="text-xs text-slate-500">
                            +{repo.categories.length - 3} till
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="flex items-center gap-1">
                        <span className={`text-lg font-bold ${
                          repo.score >= 80 ? 'text-emerald-400' :
                          repo.score >= 60 ? 'text-yellow-400' :
                          'text-orange-400'
                        }`}>
                          {repo.score}
                        </span>
                        <span className="text-xs text-slate-500">poäng</span>
                      </div>
                      {repo.lastUpdated && (
                        <p className="mt-1 text-xs text-slate-500">
                          Uppdaterad {new Date(repo.lastUpdated).toLocaleDateString('sv-SE')}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Organizations List */}
        {organizations.length === 0 ? (
          <div className="rounded-2xl bg-white/10 p-12 text-center backdrop-blur">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-700">
              <svg
                className="h-8 w-8 text-slate-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-white">
              Inga organisationer
            </h2>
            <p className="mt-2 text-slate-400">
              Du har inte registrerat några organisationer än. Börja med att
              registrera din första organisation.
            </p>
            <Link
              href="/register"
              className="mt-6 inline-block rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white transition hover:bg-blue-600"
            >
              Registrera organisation
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {organizations.map((org) => (
              <div
                key={org.id}
                className="rounded-2xl bg-white/10 p-6 backdrop-blur"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={org.avatarUrl}
                    alt={org.name}
                    className="h-16 w-16 rounded-xl"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-xl font-semibold text-white">
                        {org.name}
                      </h2>
                      <span className="rounded-full bg-slate-700 px-3 py-0.5 text-xs font-medium text-slate-300">
                        {ORG_TYPE_LABELS[org.type] || 'Utvecklare'}
                      </span>
                      {org.verified ? (
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
                    <p className="text-slate-400">/{org.slug}</p>

                    {/* Capabilities for service providers */}
                    {org.type === 'service_provider' && org.capabilities && org.capabilities.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {org.capabilities.map((cap) => (
                          <span
                            key={cap}
                            className="rounded bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-300"
                          >
                            {cap}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-4">
                      <div className="rounded-lg bg-white/5 px-4 py-2">
                        <span className="text-2xl font-bold text-white">
                          {org.repoCount}
                        </span>
                        <span className="ml-2 text-sm text-slate-400">
                          registrerade repos
                        </span>
                      </div>
                      {org.createdAt && (
                        <div className="rounded-lg bg-white/5 px-4 py-2">
                          <span className="text-sm text-slate-400">
                            Registrerad{' '}
                            {new Date(org.createdAt).toLocaleDateString('sv-SE')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Verification info banner for unverified orgs */}
                {!org.verified && (
                  <div className="mt-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-4">
                    <div className="flex items-start gap-3">
                      <svg className="h-5 w-5 text-yellow-400 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <h4 className="font-medium text-yellow-300">Verifiering pågår</h4>
                        <p className="mt-1 text-sm text-yellow-200/70">
                          Din organisation väntar på verifiering av en administratör.
                          Dina projekt syns i katalogen men markeras som ej verifierade.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="mt-6 border-t border-white/10 pt-6">
                  <h3 className="text-sm font-semibold text-slate-300">
                    Snabbåtgärder
                  </h3>
                  <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <Link
                      href={`/organization/${org.id}`}
                      className="flex items-center gap-3 rounded-lg bg-white/5 p-4 transition hover:bg-white/10"
                    >
                      <svg
                        className="h-5 w-5 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      <div>
                        <div className="font-medium text-white">
                          Redigera profil
                        </div>
                        <div className="text-sm text-slate-400">
                          Ändra typ och tjänster
                        </div>
                      </div>
                    </Link>
                    <a
                      href={`https://github.com/${org.name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg bg-white/5 p-4 transition hover:bg-white/10"
                    >
                      <svg
                        className="h-5 w-5 text-slate-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <div>
                        <div className="font-medium text-white">
                          Öppna på GitHub
                        </div>
                        <div className="text-sm text-slate-400">
                          Se organisation på GitHub
                        </div>
                      </div>
                    </a>
                    <Link
                      href={`/catalog?owner=${org.name}`}
                      className="flex items-center gap-3 rounded-lg bg-white/5 p-4 transition hover:bg-white/10"
                    >
                      <svg
                        className="h-5 w-5 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      <div>
                        <div className="font-medium text-white">
                          Visa i katalogen
                        </div>
                        <div className="text-sm text-slate-400">
                          Se registrerade repos
                        </div>
                      </div>
                    </Link>
                  </div>
                </div>

                {/* Setup Instructions */}
                <div className="mt-6 rounded-lg bg-blue-500/10 p-4">
                  <h3 className="font-semibold text-blue-300">
                    Hur registrerar jag repos?
                  </h3>
                  <p className="mt-2 text-sm text-blue-200/80">
                    Lägg till vår GitHub Action i dina repos för att automatiskt
                    registrera dem i katalogen. Se{' '}
                    <a
                      href="https://github.com/marketplace/actions/dis-publiccode-yml-validator"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline hover:no-underline"
                    >
                      dokumentationen
                    </a>{' '}
                    för mer information.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Help Section */}
        <div className="mt-12 rounded-2xl bg-white/5 p-8 backdrop-blur">
          <h2 className="text-xl font-semibold text-white">Behöver du hjälp?</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <a
              href="https://github.com/Cetriq/publiccode-tools#readme"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-lg bg-white/5 p-4 transition hover:bg-white/10"
            >
              <h3 className="font-medium text-white group-hover:text-blue-300">
                Dokumentation
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Läs mer om hur du använder SamhällsKodex
              </p>
            </a>
            <a
              href="https://github.com/Cetriq/publiccode-tools/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="group rounded-lg bg-white/5 p-4 transition hover:bg-white/10"
            >
              <h3 className="font-medium text-white group-hover:text-blue-300">
                Rapportera problem
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Öppna ett ärende på GitHub
              </p>
            </a>
            <Link
              href="/editor"
              className="group rounded-lg bg-white/5 p-4 transition hover:bg-white/10"
            >
              <h3 className="font-medium text-white group-hover:text-blue-300">
                Skapa publiccode.yml
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Använd vår visuella redigerare
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
