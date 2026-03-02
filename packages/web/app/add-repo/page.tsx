'use client';

import { useSession, signIn } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';

interface RegisterResult {
  success: boolean;
  message: string;
  project?: {
    name: string;
    description: string;
    url: string;
    score: number;
    categories: string[];
  };
  error?: string;
  errorCode?: string;
  editorUrl?: string;
  validationErrors?: string[];
}

export default function AddRepoPage() {
  const { data: session, status } = useSession();
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RegisterResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!repoUrl.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/repos/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ repoUrl: repoUrl.trim() }),
      });

      const data: RegisterResult = await response.json();
      setResult(data);
    } catch (err) {
      setResult({
        success: false,
        message: 'Kunde inte ansluta till servern. Försök igen.',
        errorCode: 'network_error',
      });
    } finally {
      setLoading(false);
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
        <div className="rounded-2xl bg-white/10 p-8 backdrop-blur">
          {/* Not logged in */}
          {status !== 'authenticated' && (
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/20">
                <svg className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h1 className="mt-6 text-3xl font-bold text-white">
                Registrera projekt med publiccode.yml
              </h1>
              <p className="mt-4 text-lg text-slate-300">
                Logga in med GitHub för att registrera ditt projekt i katalogen.
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

          {/* Logged in - show form */}
          {status === 'authenticated' && !result?.success && (
            <div>
              <h1 className="text-2xl font-bold text-white">
                Registrera projekt
              </h1>
              <p className="mt-2 text-slate-300">
                Ange URL:en till ditt GitHub-repo som redan har en <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm">publiccode.yml</code> i roten.
              </p>

              <form onSubmit={handleSubmit} className="mt-8">
                <label htmlFor="repoUrl" className="block text-sm font-medium text-slate-300">
                  Repo-URL
                </label>
                <input
                  type="url"
                  id="repoUrl"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/din-org/ditt-repo"
                  className="mt-2 w-full rounded-xl bg-slate-800 border border-slate-600 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !repoUrl.trim()}
                  className="mt-4 w-full rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Kontrollerar...
                    </span>
                  ) : (
                    'Registrera projekt'
                  )}
                </button>
              </form>

              {/* Error result */}
              {result && !result.success && (
                <div className="mt-6">
                  <div className="rounded-lg bg-red-500/20 p-4">
                    <div className="flex items-start gap-3">
                      <svg className="h-5 w-5 text-red-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-medium text-red-200">{result.message}</p>

                        {/* Validation errors */}
                        {result.validationErrors && result.validationErrors.length > 0 && (
                          <ul className="mt-2 list-disc list-inside text-sm text-red-300">
                            {result.validationErrors.map((err, i) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        )}

                        {/* Link to editor if no yml found */}
                        {result.editorUrl && (
                          <Link
                            href={result.editorUrl}
                            className="mt-3 inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Skapa publiccode.yml i editorn
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Help text */}
                  {result.errorCode === 'not_found' && (
                    <div className="mt-4 rounded-lg bg-blue-500/20 p-4 text-blue-200">
                      <h3 className="font-semibold">Saknar du publiccode.yml?</h3>
                      <p className="mt-2 text-sm">
                        Använd vår <Link href="/editor" className="underline font-medium">editor</Link> för att skapa en automatiskt med AI-analys av ditt repo.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Help section */}
              <div className="mt-8 pt-8 border-t border-white/10">
                <h3 className="text-sm font-medium text-slate-400">Har du ingen publiccode.yml ännu?</h3>
                <div className="mt-3">
                  <Link
                    href="/editor"
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 px-5 py-3 font-semibold text-white hover:from-purple-600 hover:to-blue-600 transition"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Skapa med AI-editor
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Success state */}
          {result?.success && result.project && (
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
                  {result.message}
                </h1>
              </div>

              {/* Project card */}
              <div className="mt-8 rounded-xl bg-white/5 p-6">
                <h2 className="text-xl font-semibold text-white">
                  {result.project.name}
                </h2>
                {result.project.description && (
                  <p className="mt-2 text-slate-300">{result.project.description}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-sm text-green-300">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {result.project.score} poäng
                  </span>
                  {result.project.categories.map((cat) => (
                    <span
                      key={cat}
                      className="rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-300"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
                <a
                  href={result.project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {result.project.url}
                </a>
              </div>

              {/* Actions */}
              <div className="mt-8 flex gap-4">
                <Link
                  href="/catalog"
                  className="flex-1 rounded-xl bg-blue-500 px-6 py-3 font-semibold text-white text-center transition hover:bg-blue-600"
                >
                  Visa i katalogen
                </Link>
                <button
                  onClick={() => {
                    setResult(null);
                    setRepoUrl('');
                  }}
                  className="rounded-xl bg-white/10 px-6 py-3 font-medium text-white transition hover:bg-white/20"
                >
                  Lägg till fler
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
