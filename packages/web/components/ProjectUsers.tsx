'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// Labels for organization types
const ORG_TYPE_LABELS: Record<string, string> = {
  municipality: 'Kommun',
  region: 'Region',
  public_sector: 'Offentlig sektor',
  developer: 'Utvecklare',
  service_provider: 'Leverantör',
};

interface ProjectUser {
  id: string;
  name: string;
  slug: string;
  type: string;
  avatarUrl: string;
  location?: string;
}

interface ProjectUsersProps {
  projectId: string;
}

export default function ProjectUsers({ projectId }: ProjectUsersProps) {
  const [users, setUsers] = useState<ProjectUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch(`/api/projects/${projectId}/users`);
        const data = await response.json();

        if (data.success) {
          setUsers(data.users);
        } else {
          setError(data.message || 'Kunde inte hämta användare');
        }
      } catch (err) {
        setError('Ett fel uppstod');
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [projectId]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white/5 p-6 backdrop-blur">
        <h2 className="text-xl font-semibold text-white mb-4">Används av</h2>
        <div className="animate-pulse space-y-3">
          <div className="h-12 bg-white/10 rounded-lg"></div>
          <div className="h-12 bg-white/10 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return null; // Silently fail - don't show section if error
  }

  if (users.length === 0) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-6">
        <h2 className="text-xl font-semibold text-white mb-3">Används av</h2>
        <p className="text-slate-300 mb-4">
          Inga organisationer har ännu registrerat att de använder detta projekt.
          Om din kommun eller myndighet använder det, registrera er för att visa det!
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-4 py-2 font-medium text-emerald-300 hover:bg-emerald-500/30 transition-colors"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Registrera din organisation
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/5 p-6 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-white">Används av</h2>
        <span className="text-sm text-slate-400">{users.length} organisation{users.length !== 1 ? 'er' : ''}</span>
      </div>

      <p className="text-sm text-slate-400 mb-4">
        Dessa organisationer har registrerat att de använder detta projekt.
      </p>

      <div className="flex flex-wrap gap-3">
        {users.map((user) => (
          <Link
            key={user.id}
            href={`/organisationer/${user.slug}`}
            className="group flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 hover:bg-white/10 transition-colors"
          >
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="h-6 w-6 rounded"
              />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-700 text-xs font-medium text-white">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                {user.name}
              </span>
              {user.type && (
                <span className="ml-1.5 text-xs text-slate-500">
                  {ORG_TYPE_LABELS[user.type] || user.type}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <p className="text-sm text-slate-400">
          Använder din organisation detta projekt?{' '}
          <Link
            href="/register"
            className="text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Registrera er
          </Link>
        </p>
      </div>
    </div>
  );
}
