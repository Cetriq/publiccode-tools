'use client';

import { useState, FormEvent } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { isKommunEmail, getKommunFromEmail } from '@/data/kommun-domains';

export default function KommunLoginPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email format
    if (!email || !email.includes('@')) {
      setError('Ange en giltig e-postadress');
      return;
    }

    // Validate kommun domain
    if (!isKommunEmail(email)) {
      setError('Endast kommunala e-postadresser (@kommun.se) är tillåtna. Kontakta oss om din kommun saknas.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await signIn('email', {
        email,
        redirect: false,
        callbackUrl: '/dashboard',
      });

      if (result?.error) {
        setError('Kunde inte skicka inloggningslänk. Försök igen.');
      } else {
        setEmailSent(true);
      }
    } catch {
      setError('Ett oväntat fel inträffade. Försök igen.');
    } finally {
      setIsLoading(false);
    }
  };

  const kommun = email ? getKommunFromEmail(email) : null;

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="rounded-2xl bg-white/10 p-8 backdrop-blur text-center">
            <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">Kolla din e-post</h1>
            <p className="text-slate-400 mb-6">
              Vi har skickat en inloggningslänk till <span className="text-white font-medium">{email}</span>
            </p>

            {kommun && (
              <p className="text-slate-500 text-sm mb-6">
                Välkommen, {kommun} kommun!
              </p>
            )}

            <div className="bg-slate-800/50 rounded-lg p-4 text-left text-sm text-slate-400">
              <p className="mb-2">Tips:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Länken är giltig i 24 timmar</li>
                <li>Kolla skräpposten om du inte hittar mailet</li>
                <li>Du kan stänga denna flik</li>
              </ul>
            </div>

            <button
              onClick={() => {
                setEmailSent(false);
                setEmail('');
              }}
              className="mt-6 text-blue-400 hover:text-blue-300 text-sm"
            >
              Använd en annan e-postadress
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-2xl font-bold text-white">SamhällsKodex</h1>
          </Link>
          <p className="mt-2 text-slate-400">Logga in med din kommunala e-postadress</p>
        </div>

        <div className="rounded-2xl bg-white/10 p-8 backdrop-blur">
          <div className="mb-6">
            <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-blue-200">
                Passwordless-inloggning för Sveriges 290 kommuner. Ange din @kommun.se-adress så skickar vi en säker inloggningslänk.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                E-postadress
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                placeholder="namn@kommun.se"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                disabled={isLoading}
                autoComplete="email"
                autoFocus
              />
              {kommun && (
                <p className="mt-2 text-sm text-green-400">
                  {kommun} kommun
                </p>
              )}
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email || !isKommunEmail(email)}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Skickar...
                </span>
              ) : (
                'Skicka inloggningslänk'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-center text-sm text-slate-400">
              Inte från en kommun?{' '}
              <Link href="/register" className="text-blue-400 hover:text-blue-300">
                Logga in med GitHub
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Genom att logga in godkänner du våra{' '}
          <Link href="/terms" className="text-slate-400 hover:text-white">
            användarvillkor
          </Link>
        </p>
      </div>
    </div>
  );
}
