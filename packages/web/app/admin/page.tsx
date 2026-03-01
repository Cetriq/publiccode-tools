'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface AdminStats {
  organizations: {
    total: number;
    verified: number;
    pending: number;
  };
  users: {
    total: number;
    admins: number;
  };
  repos: {
    total: number;
  };
}

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/register');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchStats();
    }
  }, [status]);

  async function fetchStats() {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();

      if (response.status === 403) {
        setError('Du har inte behörighet att se denna sida');
        return;
      }

      if (data.success) {
        setStats(data.stats);
      } else {
        setError(data.message || 'Kunde inte hämta statistik');
      }
    } catch (err) {
      setError('Kunde inte hämta statistik');
    } finally {
      setLoading(false);
    }
  }

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
            Tillbaka till Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-500/20 p-3">
              <svg className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Admin-panel</h1>
              <p className="text-slate-400">Hantera SamhällsKodex-plattformen</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-white/10 p-6 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold text-white">{stats.organizations.total}</div>
                  <div className="text-sm text-slate-400">Organisationer</div>
                </div>
                <div className="rounded-full bg-blue-500/20 p-3">
                  <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 flex gap-4 text-sm">
                <span className="text-green-400">{stats.organizations.verified} verifierade</span>
                <span className="text-yellow-400">{stats.organizations.pending} väntar</span>
              </div>
            </div>

            <div className="rounded-xl bg-white/10 p-6 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold text-white">{stats.users.total}</div>
                  <div className="text-sm text-slate-400">Användare</div>
                </div>
                <div className="rounded-full bg-green-500/20 p-3">
                  <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <div className="mt-4 text-sm">
                <span className="text-purple-400">{stats.users.admins} administratörer</span>
              </div>
            </div>

            <div className="rounded-xl bg-white/10 p-6 backdrop-blur">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold text-white">{stats.repos.total}</div>
                  <div className="text-sm text-slate-400">Projekt</div>
                </div>
                <div className="rounded-full bg-orange-500/20 p-3">
                  <svg className="h-6 w-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Admin Actions */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/organizations"
            className="group rounded-xl bg-white/10 p-6 backdrop-blur transition hover:bg-white/15"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-blue-500/20 p-3 transition group-hover:bg-blue-500/30">
                <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">Organisationer</h3>
                <p className="text-sm text-slate-400">Verifiera och hantera organisationer</p>
              </div>
            </div>
            {stats && stats.organizations.pending > 0 && (
              <div className="mt-4 rounded-lg bg-yellow-500/20 px-3 py-2 text-sm text-yellow-300">
                {stats.organizations.pending} organisationer väntar på verifiering
              </div>
            )}
          </Link>

          <Link
            href="/admin/users"
            className="group rounded-xl bg-white/10 p-6 backdrop-blur transition hover:bg-white/15"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-green-500/20 p-3 transition group-hover:bg-green-500/30">
                <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">Användare</h3>
                <p className="text-sm text-slate-400">Hantera användare och administratörer</p>
              </div>
            </div>
            {stats && stats.users.admins > 0 && (
              <div className="mt-4 rounded-lg bg-purple-500/20 px-3 py-2 text-sm text-purple-300">
                {stats.users.admins} administratör{stats.users.admins > 1 ? 'er' : ''}
              </div>
            )}
          </Link>

          <Link
            href="/admin/migrate"
            className="group rounded-xl bg-white/10 p-6 backdrop-blur transition hover:bg-white/15"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-orange-500/20 p-3 transition group-hover:bg-orange-500/30">
                <svg className="h-6 w-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">Migrering</h3>
                <p className="text-sm text-slate-400">Databasmigrering och verktyg</p>
              </div>
            </div>
          </Link>

          <div className="rounded-xl bg-white/5 p-6 border border-dashed border-white/10">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-slate-500/20 p-3">
                <svg className="h-6 w-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-slate-400">Fler funktioner</h3>
                <p className="text-sm text-slate-500">Kommer snart...</p>
              </div>
            </div>
          </div>
        </div>

        {/* Current Admin Info */}
        <div className="mt-8 rounded-xl bg-purple-500/10 border border-purple-500/20 p-6">
          <div className="flex items-center gap-4">
            {session?.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name || ''}
                className="h-12 w-12 rounded-full"
              />
            )}
            <div>
              <div className="text-sm text-purple-300">Inloggad som administratör</div>
              <div className="font-medium text-white">{session?.user?.name}</div>
              <div className="text-sm text-slate-400">@{session?.user?.login || session?.user?.email}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
