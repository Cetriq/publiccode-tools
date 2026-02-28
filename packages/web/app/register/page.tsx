'use client';

import { useSession, signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface GitHubOrg {
  id: number;
  login: string;
  avatar_url: string;
  description: string | null;
}

type Step = 'login' | 'select-org' | 'confirm' | 'success';

export default function RegisterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [step, setStep] = useState<Step>('login');
  const [organizations, setOrganizations] = useState<GitHubOrg[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<GitHubOrg | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Update step based on session status
  useEffect(() => {
    if (status === 'authenticated' && step === 'login') {
      setStep('select-org');
      fetchOrganizations();
    }
  }, [status, step]);

  async function fetchOrganizations() {
    if (!session?.accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('https://api.github.com/user/orgs', {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        throw new Error('Kunde inte hämta organisationer');
      }

      const orgs = await response.json();
      setOrganizations(orgs);

      // Also add the user as a "personal" option
      if (session.user?.login) {
        setOrganizations([
          {
            id: parseInt(session.user.id),
            login: session.user.login,
            avatar_url: session.user.image || '',
            description: 'Ditt personliga konto',
          },
          ...orgs,
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod');
    } finally {
      setLoading(false);
    }
  }

  async function registerOrganization() {
    if (!selectedOrg || !session?.accessToken) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orgId: selectedOrg.id.toString(),
          orgName: selectedOrg.login,
          orgAvatar: selectedOrg.avatar_url,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Kunde inte registrera organisationen');
      }

      const data = await response.json();
      setApiKey(data.apiKey);
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ett fel uppstod');
    } finally {
      setLoading(false);
    }
  }

  function copyApiKey() {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-32">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <div className="animate-pulse text-white">Laddar...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-32 pb-16">
      <div className="mx-auto max-w-2xl px-4">
        {/* Progress indicator */}
        <div className="mb-12 flex justify-center">
          <div className="flex items-center gap-4">
            <StepIndicator
              number={1}
              label="Logga in"
              active={step === 'login'}
              completed={step !== 'login'}
            />
            <div className="h-px w-8 bg-white/20" />
            <StepIndicator
              number={2}
              label="Välj org"
              active={step === 'select-org'}
              completed={step === 'confirm' || step === 'success'}
            />
            <div className="h-px w-8 bg-white/20" />
            <StepIndicator
              number={3}
              label="Bekräfta"
              active={step === 'confirm'}
              completed={step === 'success'}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white/10 p-8 backdrop-blur">
          {/* Step 1: Login */}
          {step === 'login' && (
            <div className="text-center">
              <h1 className="text-3xl font-bold text-white">
                Registrera din organisation
              </h1>
              <p className="mt-4 text-lg text-slate-300">
                Logga in med GitHub för att börja registrera dina projekt i
                DIS-katalogen.
              </p>
              <button
                onClick={() => signIn('github')}
                className="mt-8 inline-flex items-center gap-3 rounded-xl bg-slate-800 px-8 py-4 font-semibold text-white transition hover:bg-slate-700 border border-slate-600"
              >
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                    clipRule="evenodd"
                  />
                </svg>
                Logga in med GitHub
              </button>
            </div>
          )}

          {/* Step 2: Select Organization */}
          {step === 'select-org' && (
            <div>
              <h1 className="text-2xl font-bold text-white">
                Välj organisation
              </h1>
              <p className="mt-2 text-slate-300">
                Välj vilken organisation du vill registrera i DIS-katalogen.
              </p>

              {error && (
                <div className="mt-4 rounded-lg bg-red-500/20 p-4 text-red-200">
                  {error}
                </div>
              )}

              {loading ? (
                <div className="mt-8 text-center text-white">
                  <div className="animate-pulse">Hämtar organisationer...</div>
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {organizations.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => {
                        setSelectedOrg(org);
                        setStep('confirm');
                      }}
                      className="flex w-full items-center gap-4 rounded-xl bg-white/5 p-4 text-left transition hover:bg-white/10"
                    >
                      <img
                        src={org.avatar_url}
                        alt={org.login}
                        className="h-12 w-12 rounded-full"
                      />
                      <div>
                        <div className="font-semibold text-white">
                          {org.login}
                        </div>
                        {org.description && (
                          <div className="text-sm text-slate-400">
                            {org.description}
                          </div>
                        )}
                      </div>
                      <svg
                        className="ml-auto h-5 w-5 text-slate-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && selectedOrg && (
            <div>
              <h1 className="text-2xl font-bold text-white">
                Bekräfta registrering
              </h1>
              <p className="mt-2 text-slate-300">
                Du är på väg att registrera följande organisation:
              </p>

              <div className="mt-6 flex items-center gap-4 rounded-xl bg-white/5 p-6">
                <img
                  src={selectedOrg.avatar_url}
                  alt={selectedOrg.login}
                  className="h-16 w-16 rounded-full"
                />
                <div>
                  <div className="text-xl font-semibold text-white">
                    {selectedOrg.login}
                  </div>
                  {selectedOrg.description && (
                    <div className="text-slate-400">{selectedOrg.description}</div>
                  )}
                </div>
              </div>

              <div className="mt-6 rounded-lg bg-blue-500/20 p-4 text-blue-200">
                <h3 className="font-semibold">Vad händer nu?</h3>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                  <li>En API-nyckel skapas för din organisation</li>
                  <li>Du kan använda nyckeln i GitHub Actions</li>
                  <li>Dina projekt kan sedan registreras automatiskt</li>
                </ul>
              </div>

              {error && (
                <div className="mt-4 rounded-lg bg-red-500/20 p-4 text-red-200">
                  {error}
                </div>
              )}

              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => setStep('select-org')}
                  className="rounded-xl bg-white/10 px-6 py-3 font-medium text-white transition hover:bg-white/20"
                >
                  Tillbaka
                </button>
                <button
                  onClick={registerOrganization}
                  disabled={loading}
                  className="flex-1 rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Registrerar...' : 'Registrera organisation'}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && apiKey && (
            <div>
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-500">
                  <svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h1 className="mt-4 text-2xl font-bold text-white">
                  Registrering klar!
                </h1>
                <p className="mt-2 text-slate-300">
                  Din organisation är nu registrerad. Kopiera API-nyckeln nedan.
                </p>
              </div>

              <div className="mt-8">
                <label className="block text-sm font-medium text-slate-300">
                  API-nyckel
                </label>
                <div className="mt-2 flex gap-2">
                  <code className="flex-1 rounded-lg bg-slate-800 p-4 font-mono text-sm text-green-400 break-all">
                    {apiKey}
                  </code>
                  <button
                    onClick={copyApiKey}
                    className="rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition hover:bg-blue-600"
                  >
                    {copied ? 'Kopierad!' : 'Kopiera'}
                  </button>
                </div>
              </div>

              <div className="mt-6 rounded-lg bg-amber-500/20 p-4 text-amber-200">
                <h3 className="font-semibold">Viktigt!</h3>
                <p className="mt-1 text-sm">
                  Spara denna nyckel på ett säkert ställe. Den visas bara en
                  gång och kan inte återhämtas.
                </p>
              </div>

              <div className="mt-8">
                <h3 className="font-semibold text-white">Nästa steg</h3>
                <ol className="mt-4 list-inside list-decimal space-y-3 text-slate-300">
                  <li>
                    Gå till ditt repos <strong>Settings &rarr; Secrets</strong>{' '}
                    på GitHub
                  </li>
                  <li>
                    Skapa en ny secret med namnet{' '}
                    <code className="rounded bg-slate-700 px-2 py-0.5 text-sm">
                      PUBLICCODE_REGISTRY_API_KEY
                    </code>
                  </li>
                  <li>Klistra in API-nyckeln som värde</li>
                  <li>
                    Lägg till vår GitHub Action i ditt repo (se dokumentationen)
                  </li>
                </ol>
              </div>

              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex-1 rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white transition hover:bg-blue-600"
                >
                  Gå till Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepIndicator({
  number,
  label,
  active,
  completed,
}: {
  number: number;
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold ${
          completed
            ? 'bg-green-500 text-white'
            : active
            ? 'bg-blue-500 text-white'
            : 'bg-white/20 text-white/60'
        }`}
      >
        {completed ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          number
        )}
      </div>
      <span
        className={`text-xs ${
          active || completed ? 'text-white' : 'text-white/60'
        }`}
      >
        {label}
      </span>
    </div>
  );
}
