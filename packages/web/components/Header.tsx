'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import AuthButton from './AuthButton';

export default function Header() {
  const { data: session } = useSession();
  const isAdmin = session?.user?.roles?.includes('platform_admin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <a href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-shadow">
              <svg
                className="h-5 w-5 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M16 18l2-2-2-2" />
                <path d="M8 6L6 8l2 2" />
                <path d="M14.5 4l-5 16" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              SamhällsKodex
            </span>
          </a>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <a
              href="/catalog"
              className="px-4 py-2 text-sm font-medium text-slate-300 rounded-lg transition-colors hover:text-white hover:bg-white/5"
            >
              Katalog
            </a>
            <a
              href="/editor"
              className="px-4 py-2 text-sm font-medium text-slate-300 rounded-lg transition-colors hover:text-white hover:bg-white/5"
            >
              Skapa
            </a>
            <a
              href="/leverantorer"
              className="px-4 py-2 text-sm font-medium text-slate-300 rounded-lg transition-colors hover:text-white hover:bg-white/5"
            >
              Leverantörer
            </a>
            <a
              href="/add-repo"
              className="px-4 py-2 text-sm font-medium text-slate-300 rounded-lg transition-colors hover:text-white hover:bg-white/5"
            >
              Registrera
            </a>
            <a
              href="https://github.com/Cetriq/samhallskodex"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-medium text-slate-300 rounded-lg transition-colors hover:text-white hover:bg-white/5"
            >
              GitHub
            </a>
            {isAdmin && (
              <a
                href="/admin"
                className="px-4 py-2 text-sm font-medium text-purple-300 rounded-lg transition-colors hover:text-purple-200 hover:bg-purple-500/10"
              >
                Admin
              </a>
            )}
            <div className="ml-2 pl-2 border-l border-slate-700">
              <AuthButton />
            </div>
          </nav>

          {/* Mobile menu button */}
          <button
            type="button"
            className="md:hidden rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white"
            aria-label={mobileMenuOpen ? 'Stäng meny' : 'Öppna meny'}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden border-t border-slate-800/50 py-4">
            <div className="flex flex-col gap-2">
              <a
                href="/catalog"
                className="px-4 py-2 text-sm font-medium text-slate-300 rounded-lg transition-colors hover:text-white hover:bg-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                Katalog
              </a>
              <a
                href="/editor"
                className="px-4 py-2 text-sm font-medium text-slate-300 rounded-lg transition-colors hover:text-white hover:bg-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                Skapa
              </a>
              <a
                href="/leverantorer"
                className="px-4 py-2 text-sm font-medium text-slate-300 rounded-lg transition-colors hover:text-white hover:bg-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                Leverantörer
              </a>
              <a
                href="/add-repo"
                className="px-4 py-2 text-sm font-medium text-slate-300 rounded-lg transition-colors hover:text-white hover:bg-white/5"
                onClick={() => setMobileMenuOpen(false)}
              >
                Registrera
              </a>
              <a
                href="https://github.com/Cetriq/samhallskodex"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm font-medium text-slate-300 rounded-lg transition-colors hover:text-white hover:bg-white/5"
              >
                GitHub
              </a>
              {isAdmin && (
                <a
                  href="/admin"
                  className="px-4 py-2 text-sm font-medium text-purple-300 rounded-lg transition-colors hover:text-purple-200 hover:bg-purple-500/10"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin
                </a>
              )}
              <div className="pt-4 mt-2 border-t border-slate-800/50 px-4">
                <AuthButton />
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
