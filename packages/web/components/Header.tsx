'use client';

import AuthButton from './AuthButton';

export default function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-500">
              <svg
                className="h-6 w-6 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-tight text-white">
                Digital Infrastruktur
              </span>
              <span className="text-sm font-medium leading-tight text-slate-300">
                för Samhällsservice
              </span>
            </div>
          </a>
          <nav className="flex items-center gap-6">
            <a
              href="/catalog"
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              Katalog
            </a>
            <a
              href="/editor"
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              Redigerare
            </a>
            <a
              href="/add-repo"
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              Lägg till projekt
            </a>
            <a
              href="https://github.com/Cetriq/publiccode-tools"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              Källkod
            </a>
            <AuthButton />
          </nav>
          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
            aria-label="Öppna meny"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
