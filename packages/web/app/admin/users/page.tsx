'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface User {
  id: string;
  login: string;
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  roles: string[];
  verified: boolean;
  createdAt: string | null;
  lastLogin: string | null;
}

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/register');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchUsers();
    }
  }, [status]);

  async function fetchUsers() {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (response.status === 403) {
        setError('Du har inte behörighet att se denna sida');
        return;
      }

      if (data.success) {
        setUsers(data.users);
      } else {
        setError(data.message || 'Kunde inte hämta användare');
      }
    } catch (err) {
      setError('Kunde inte hämta användare');
    } finally {
      setLoading(false);
    }
  }

  async function toggleAdminRole(userId: string, hasAdminRole: boolean) {
    setUpdating(userId);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action: hasAdminRole ? 'remove' : 'add',
          role: 'platform_admin',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, roles: data.roles } : user
          )
        );
      } else {
        alert(data.message || 'Kunde inte uppdatera');
      }
    } catch (err) {
      alert('Ett fel uppstod');
    } finally {
      setUpdating(null);
    }
  }

  async function toggleVerified(userId: string, isVerified: boolean) {
    setUpdating(userId);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          verified: !isVerified,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user.id === userId ? { ...user, verified: data.verified } : user
          )
        );
      } else {
        alert(data.message || 'Kunde inte uppdatera');
      }
    } catch (err) {
      alert('Ett fel uppstod');
    } finally {
      setUpdating(null);
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
          <Link href="/admin" className="mt-4 inline-block text-blue-400 hover:underline">
            Tillbaka till Admin
          </Link>
        </div>
      </div>
    );
  }

  const adminCount = users.filter((u) => u.roles.includes('platform_admin')).length;
  const verifiedCount = users.filter((u) => u.verified || u.roles.includes('platform_admin')).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-32 pb-16">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin"
            className="mb-4 inline-flex items-center text-slate-400 hover:text-white"
          >
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Tillbaka till Admin
          </Link>
          <h1 className="text-3xl font-bold text-white">Användare</h1>
          <p className="mt-2 text-slate-400">Hantera användare och administratörer</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-xl bg-white/10 p-4 backdrop-blur">
            <div className="text-3xl font-bold text-white">{users.length}</div>
            <div className="text-sm text-slate-400">Totalt antal användare</div>
          </div>
          <div className="rounded-xl bg-blue-500/20 p-4">
            <div className="text-3xl font-bold text-blue-300">{verifiedCount}</div>
            <div className="text-sm text-blue-200/70">Verifierade</div>
          </div>
          <div className="rounded-xl bg-purple-500/20 p-4">
            <div className="text-3xl font-bold text-purple-300">{adminCount}</div>
            <div className="text-sm text-purple-200/70">Administratörer</div>
          </div>
          <div className="rounded-xl bg-amber-500/20 p-4">
            <div className="text-3xl font-bold text-amber-300">{users.length - verifiedCount}</div>
            <div className="text-sm text-amber-200/70">Väntar på verifiering</div>
          </div>
        </div>

        {/* Users list */}
        <div className="space-y-3">
          {users.length === 0 ? (
            <div className="rounded-xl bg-white/10 p-8 text-center backdrop-blur">
              <p className="text-slate-400">Inga användare hittades</p>
            </div>
          ) : (
            users.map((user) => {
              const isAdmin = user.roles.includes('platform_admin');
              const isVerified = user.verified || isAdmin;
              const isCurrentUser = session?.user?.id === user.id;

              return (
                <div
                  key={user.id}
                  className={`rounded-xl bg-white/10 p-4 backdrop-blur ${
                    isCurrentUser ? 'ring-2 ring-purple-500/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name || user.login}
                        className="h-12 w-12 rounded-full"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-700 text-white">
                        {(user.name || user.login || '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-white">
                          {user.name || user.login}
                        </h3>
                        {isCurrentUser && (
                          <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">
                            Du
                          </span>
                        )}
                        {isVerified && (
                          <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300 flex items-center gap-1">
                            <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                              <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
                            </svg>
                            Verifierad
                          </span>
                        )}
                        {isAdmin && (
                          <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-300">
                            Admin
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                        <span>@{user.login}</span>
                        {user.email && <span>{user.email}</span>}
                        {user.createdAt && (
                          <span>
                            Registrerad {new Date(user.createdAt).toLocaleDateString('sv-SE')}
                          </span>
                        )}
                        {user.lastLogin && (
                          <span>
                            Senast inloggad {new Date(user.lastLogin).toLocaleDateString('sv-SE')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={`https://github.com/${user.login}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white"
                        title="Se på GitHub"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                      </a>
                      {!isAdmin && (
                        <button
                          onClick={() => toggleVerified(user.id, user.verified)}
                          disabled={updating === user.id}
                          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                            user.verified
                              ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
                              : 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30'
                          } disabled:opacity-50`}
                        >
                          {updating === user.id
                            ? 'Sparar...'
                            : user.verified
                            ? 'Ta bort verifiering'
                            : 'Verifiera'}
                        </button>
                      )}
                      {!isCurrentUser && (
                        <button
                          onClick={() => toggleAdminRole(user.id, isAdmin)}
                          disabled={updating === user.id}
                          className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                            isAdmin
                              ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                              : 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30'
                          } disabled:opacity-50`}
                        >
                          {updating === user.id
                            ? 'Sparar...'
                            : isAdmin
                            ? 'Ta bort admin'
                            : 'Gör till admin'}
                        </button>
                      )}
                      {isCurrentUser && (
                        <span className="rounded-lg bg-slate-500/20 px-4 py-2 text-sm text-slate-400">
                          Kan inte ändra egen roll
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Info box */}
        <div className="mt-8 rounded-xl bg-blue-500/10 border border-blue-500/20 p-6">
          <h3 className="font-semibold text-blue-300 mb-2">Om verifiering och roller</h3>
          <ul className="text-sm text-slate-400 space-y-1">
            <li>• <strong className="text-blue-300">Verifierade användare</strong> kan registrera projekt i katalogen</li>
            <li>• <strong className="text-purple-300">Administratörer</strong> räknas automatiskt som verifierade och kan hantera användare</li>
            <li>• Icke-verifierade användare kan logga in men inte lägga till projekt</li>
            <li>• Den sista administratören kan inte tas bort</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
