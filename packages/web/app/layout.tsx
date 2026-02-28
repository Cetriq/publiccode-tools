import './globals.css';
import type { Metadata } from 'next';
import SessionProvider from '@/components/SessionProvider';
import Header from '@/components/Header';

export const metadata: Metadata = {
  title: 'Digital Infrastruktur för Samhällsservice - publiccode.yml',
  description: 'Verktyg för att beskriva och dela öppen programvara i svensk offentlig sektor',
  keywords: ['publiccode', 'DIS', 'open source', 'Sverige', 'offentlig sektor', 'digital infrastruktur'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv" suppressHydrationWarning>
      <body className="min-h-screen">
        <SessionProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </SessionProvider>
      </body>
    </html>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
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
                <span className="text-sm font-medium leading-tight text-slate-400">
                  för Samhällsservice
                </span>
              </div>
            </div>
            <p className="mt-4 max-w-md text-slate-400">
              Verktyg för att beskriva och dela öppen programvara i svensk offentlig sektor.
              Tillsammans bygger vi en digital infrastruktur för samhället.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Verktyg
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="/catalog"
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Projektkatalog
                </a>
              </li>
              <li>
                <a
                  href="/editor"
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Visuell redigerare
                </a>
              </li>
              <li>
                <a
                  href="https://www.npmjs.com/package/@godwana/publiccode-cli"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Kommandoradsverktyg
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/marketplace/actions/dis-publiccode-yml-validator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  GitHub-integration
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
              Resurser
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="https://github.com/Cetriq/publiccode-tools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Källkod på GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://www.npmjs.com/org/godwana"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  Paket på npm
                </a>
              </li>
              <li>
                <a
                  href="https://yml.publiccode.tools/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 transition-colors hover:text-white"
                >
                  publiccode.yml-standard
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 sm:flex-row">
          <p className="text-sm text-slate-400">
            Öppen källkod under MIT-licens. Bidra gärna!
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/Cetriq/publiccode-tools"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 transition-colors hover:text-white"
              aria-label="GitHub"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
            <a
              href="https://www.npmjs.com/org/godwana"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 transition-colors hover:text-white"
              aria-label="npm"
            >
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M0 7.334v8h6.666v1.332H12v-1.332h12v-8H0zm6.666 6.664H5.334v-4H3.999v4H1.335V8.667h5.331v5.331zm4 0v1.336H8.001V8.667h5.334v5.332h-2.669v-.001zm12.001 0h-1.33v-4h-1.336v4h-1.335v-4h-1.33v4h-2.671V8.667h8.002v5.331zM10.665 10H12v2.667h-1.335V10z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
