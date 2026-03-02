'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

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

interface UserOrganization {
  id: string;
  name: string;
  slug: string;
  avatarUrl?: string;
}

interface ProjectUsersProps {
  projectId: string;
}

export default function ProjectUsers({ projectId }: ProjectUsersProps) {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<ProjectUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For registration modal
  const [showModal, setShowModal] = useState(false);
  const [userOrgs, setUserOrgs] = useState<UserOrganization[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [registerResult, setRegisterResult] = useState<{ success: boolean; message: string } | null>(null);

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

  // Fetch user's organizations when modal opens
  useEffect(() => {
    async function fetchUserOrgs() {
      if (!showModal || !session?.user?.id) return;

      setLoadingOrgs(true);
      try {
        const response = await fetch('/api/organizations');
        const data = await response.json();

        if (data.success) {
          // Filter out orgs already using this project
          const userIds = users.map(u => u.id);
          const availableOrgs = (data.organizations || []).filter(
            (org: UserOrganization) => !userIds.includes(org.id)
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
  }, [showModal, session?.user?.id, users]);

  const handleRegister = async (orgId: string) => {
    setRegistering(true);
    setRegisterResult(null);

    try {
      const response = await fetch(`/api/organizations/${orgId}/uses-projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId }),
      });

      const data = await response.json();

      if (data.success) {
        setRegisterResult({ success: true, message: 'Din organisation har registrerats som användare!' });
        // Refresh users list
        const usersResponse = await fetch(`/api/projects/${projectId}/users`);
        const usersData = await usersResponse.json();
        if (usersData.success) {
          setUsers(usersData.users);
        }
        // Close modal after short delay
        setTimeout(() => {
          setShowModal(false);
          setRegisterResult(null);
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

  const handleRegisterClick = () => {
    if (status !== 'authenticated') {
      // Redirect to login
      window.location.href = '/register';
      return;
    }
    setShowModal(true);
  };

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

  // Modal component
  const RegisterModal = () => {
    if (!showModal) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
        <div className="relative w-full max-w-md rounded-2xl bg-slate-800 border border-slate-700 p-6 shadow-xl">
          <button
            onClick={() => setShowModal(false)}
            className="absolute right-4 top-4 text-slate-400 hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h3 className="text-lg font-semibold text-white mb-4">Registrera som användare</h3>

          {registerResult ? (
            <div className={`rounded-lg p-4 ${registerResult.success ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
              {registerResult.message}
            </div>
          ) : loadingOrgs ? (
            <div className="animate-pulse space-y-3">
              <div className="h-12 bg-white/10 rounded-lg"></div>
              <div className="h-12 bg-white/10 rounded-lg"></div>
            </div>
          ) : userOrgs.length === 0 ? (
            <div className="text-slate-300">
              <p className="mb-4">Du har inga organisationer att registrera, eller alla dina organisationer använder redan detta projekt.</p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300"
              >
                Skapa en organisation
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-400 mb-4">
                Välj vilken organisation som ska registreras som användare av detta projekt:
              </p>
              {userOrgs.map((org) => (
                <button
                  key={org.id}
                  onClick={() => handleRegister(org.id)}
                  disabled={registering}
                  className="w-full flex items-center gap-3 rounded-lg bg-white/5 p-3 hover:bg-white/10 transition-colors disabled:opacity-50 text-left"
                >
                  {org.avatarUrl ? (
                    <img src={org.avatarUrl} alt={org.name} className="h-10 w-10 rounded" />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-700 text-lg font-medium text-white">
                      {org.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium text-white">{org.name}</span>
                  {registering && (
                    <svg className="ml-auto h-5 w-5 animate-spin text-emerald-400" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (users.length === 0) {
    return (
      <>
        <RegisterModal />
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-6">
          <h2 className="text-xl font-semibold text-white mb-3">Används av</h2>
          <p className="text-slate-300 mb-4">
            Inga organisationer har ännu registrerat att de använder detta projekt.
            Om din kommun eller myndighet använder det, registrera er för att visa det!
          </p>
          <button
            onClick={handleRegisterClick}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500/20 px-4 py-2 font-medium text-emerald-300 hover:bg-emerald-500/30 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Registrera din organisation
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <RegisterModal />
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
            <button
              onClick={handleRegisterClick}
              className="text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              Registrera er
            </button>
          </p>
        </div>
      </div>
    </>
  );
}
