'use client';

import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface BootstrapStatus {
  available: boolean;
  reason: string;
  message?: string;
  isAdmin?: boolean;
}

export default function AdminSetupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [bootstrapStatus, setBootstrapStatus] = useState<BootstrapStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      checkBootstrapStatus();
    } else if (status === 'unauthenticated') {
      setLoading(false);
    }
  }, [status]);

  async function checkBootstrapStatus() {
    try {
      const response = await fetch('/api/admin/bootstrap');
      const data = await response.json();
      setBootstrapStatus(data);
    } catch (err) {
      setError('Kunde inte kontrollera admin-status');
    } finally {
      setLoading(false);
    }
  }

  async function activateAdmin() {
    setActivating(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/bootstrap', {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Redirect to admin panel after a short delay
        setTimeout(() => {
          router.push('/admin');
        }, 2000);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Ett fel uppstod vid aktivering');
    } finally {
      setActivating(false);
    }
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-pulse text-white">Laddar...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-32 pb-16">
      <div className="mx-auto max-w-lg px-4">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Admin-setup</h1>
          <p className="mt-2 text-slate-400">
            Aktivera administratörsrättigheter för SamhällsKodex
          </p>
        </div>

        <div className="rounded-2xl bg-white/10 p-8 backdrop-blur">
          {/* Not logged in */}
          {status === 'unauthenticated' && (
            <div className="text-center">
              <p className="text-slate-300 mb-6">
                Du måste logga in med GitHub för att kunna aktivera admin-rättigheter.
              </p>
              <button
                onClick={() => signIn('github')}
                className="inline-flex items-center gap-3 rounded-xl bg-slate-800 px-6 py-3 font-semibold text-white transition hover:bg-slate-700 border border-slate-600"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                Logga in med GitHub
              </button>
            </div>
          )}

          {/* Already admin */}
          {bootstrapStatus?.isAdmin && (
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Du är redan administratör
              </h2>
              <p className="text-slate-400 mb-6">
                Du har redan plattformsadministratörsrättigheter.
              </p>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 rounded-xl bg-purple-500 px-6 py-3 font-semibold text-white transition hover:bg-purple-600"
              >
                Gå till admin-panelen
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}

          {/* Can become admin */}
          {bootstrapStatus?.available && !success && (
            <div className="text-center">
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 mb-6">
                <p className="text-purple-200">
                  {bootstrapStatus.message || 'Du kan aktivera administratörsrättigheter för denna instans.'}
                </p>
              </div>

              {session?.user && (
                <div className="flex items-center justify-center gap-3 mb-6 p-4 bg-white/5 rounded-lg">
                  {session.user.image && (
                    <img
                      src={session.user.image}
                      alt={session.user.name || ''}
                      className="w-10 h-10 rounded-full"
                    />
                  )}
                  <div className="text-left">
                    <div className="font-medium text-white">{session.user.name}</div>
                    <div className="text-sm text-slate-400">@{session.user.login || session.user.email}</div>
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={activateAdmin}
                disabled={activating}
                className="w-full rounded-xl bg-purple-500 px-6 py-3 font-semibold text-white transition hover:bg-purple-600 disabled:opacity-50"
              >
                {activating ? 'Aktiverar...' : 'Aktivera admin-rättigheter'}
              </button>

              <p className="mt-4 text-xs text-slate-500">
                Detta ger dig full administratörsåtkomst till plattformen, inklusive möjlighet att verifiera organisationer och hantera användare.
              </p>
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Admin-rättigheter aktiverade!
              </h2>
              <p className="text-slate-400">
                Omdirigerar till admin-panelen...
              </p>
            </div>
          )}

          {/* Cannot become admin */}
          {bootstrapStatus && !bootstrapStatus.available && !bootstrapStatus.isAdmin && (
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Admin-aktivering inte tillgänglig
              </h2>
              <p className="text-slate-400 mb-4">
                {bootstrapStatus.reason === 'admin_exists'
                  ? 'En administratör finns redan för denna plattform. Kontakta befintlig admin för att få rättigheter.'
                  : bootstrapStatus.reason === 'not_in_allowed_list'
                  ? 'Ditt GitHub-konto är inte konfigurerat som tillåten administratör.'
                  : 'Du kan inte aktivera admin-rättigheter just nu.'}
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
              >
                Tillbaka till dashboard
              </Link>
            </div>
          )}
        </div>

        {/* Info box */}
        <div className="mt-6 rounded-lg bg-slate-800/50 p-4 text-sm text-slate-400">
          <h3 className="font-medium text-slate-300 mb-2">Om admin-setup</h3>
          <ul className="list-disc list-inside space-y-1">
            <li>Första användaren som når denna sida kan bli admin (om inget annat är konfigurerat)</li>
            <li>Efter första admin kan fler admins läggas till via admin-panelen</li>
            <li>Du kan begränsa vem som kan bli admin via miljövariabeln <code className="bg-slate-700 px-1 rounded">ADMIN_GITHUB_IDS</code></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
