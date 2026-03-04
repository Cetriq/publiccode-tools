'use client';

import Link from 'next/link';

export default function KomIgangPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-32 pb-16">
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white">
            Dela ditt projekt med SamhällsKodex
          </h1>
          <p className="mt-4 text-xl text-slate-300">
            Välj hur du vill komma igång
          </p>
        </div>

        {/* Choice cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Manual flow - Editor first */}
          <Link
            href="/editor?flow=register"
            className="group relative rounded-2xl bg-white/10 p-8 backdrop-blur transition hover:bg-white/15 border border-white/10 hover:border-blue-500/50"
          >
            <div className="flex flex-col h-full">
              {/* Icon */}
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>

              {/* Content */}
              <h2 className="mt-6 text-2xl font-bold text-white">
                Skapa manuellt
              </h2>
              <p className="mt-3 text-slate-300 flex-grow">
                Använd vår AI-editor för att skapa publiccode.yml, pusha till GitHub och registrera ditt projekt.
              </p>

              {/* Steps preview */}
              <div className="mt-6 space-y-2">
                <Step number={1} text="Skapa yml med AI-editor" />
                <Step number={2} text="Pusha till GitHub" />
                <Step number={3} text="Registrera i katalogen" />
              </div>

              {/* Best for */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <span className="inline-flex items-center gap-2 text-sm text-slate-400">
                  <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Bäst för enskilda projekt
                </span>
              </div>

              {/* Arrow */}
              <div className="absolute top-8 right-8 text-slate-500 group-hover:text-white transition">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Automation flow */}
          <Link
            href="/kom-igang/automation"
            className="group relative rounded-2xl bg-white/10 p-8 backdrop-blur transition hover:bg-white/15 border border-white/10 hover:border-blue-500/50"
          >
            <div className="flex flex-col h-full">
              {/* Icon */}
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-teal-500">
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>

              {/* Content */}
              <h2 className="mt-6 text-2xl font-bold text-white">
                Automatisera
              </h2>
              <p className="mt-3 text-slate-300 flex-grow">
                Sätt upp GitHub Action för automatisk registrering vid varje push till dina repos.
              </p>

              {/* Steps preview */}
              <div className="mt-6 space-y-2">
                <Step number={1} text="Logga in med GitHub" />
                <Step number={2} text="Välj organisation" />
                <Step number={3} text="Konfigurera GitHub Action" />
              </div>

              {/* Best for */}
              <div className="mt-6 pt-4 border-t border-white/10">
                <span className="inline-flex items-center gap-2 text-sm text-slate-400">
                  <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Bäst för organisationer med många repos
                </span>
              </div>

              {/* Arrow */}
              <div className="absolute top-8 right-8 text-slate-500 group-hover:text-white transition">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Help section */}
        <div className="mt-12 text-center">
          <p className="text-slate-400">
            Osäker på vilken väg du ska välja?{' '}
            <Link href="/editor?flow=register" className="text-blue-400 hover:text-blue-300 underline">
              Börja med editorn
            </Link>{' '}
            – du kan alltid automatisera senare.
          </p>
        </div>
      </div>
    </div>
  );
}

function Step({ number, text }: { number: number; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-medium text-white">
        {number}
      </span>
      <span className="text-sm text-slate-400">{text}</span>
    </div>
  );
}
