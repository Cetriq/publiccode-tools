import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DIS-Tools - publiccode.yml Editor',
  description: 'Skapa och validera publiccode.yml för svenska OSS-projekt',
  keywords: ['publiccode', 'DIS', 'open source', 'Sverige', 'offentlig sektor'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sv" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

function Header() {
  return (
    <header className="absolute top-0 z-50 w-full">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500">
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
            <span className="text-xl font-bold text-white">
              DIS-Tools
            </span>
          </a>
          <nav className="hidden items-center gap-8 md:flex">
            <a
              href="#hur-det-fungerar"
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              Hur det fungerar
            </a>
            <a
              href="/editor"
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              Redigerare
            </a>
            <a
              href="https://github.com/Cetriq/publiccode-tools"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              Källkod
            </a>
            <a
              href="/editor"
              className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              Kom igång
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500">
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
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                DIS-Tools
              </span>
            </div>
            <p className="mt-4 max-w-md text-slate-600 dark:text-slate-400">
              Verktyg för att beskriva och dela öppen programvara i svensk offentlig sektor.
              En del av initiativet Digital Infrastruktur för Samhällsservice.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Verktyg
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="/editor"
                  className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Visuell redigerare
                </a>
              </li>
              <li>
                <a
                  href="https://www.npmjs.com/package/@godwana/publiccode-cli"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Kommandoradsverktyg
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/marketplace/actions/dis-publiccode-yml-validator"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  GitHub-integration
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900 dark:text-white">
              Resurser
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <a
                  href="https://github.com/Cetriq/publiccode-tools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Källkod på GitHub
                </a>
              </li>
              <li>
                <a
                  href="https://www.npmjs.com/org/godwana"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  Paket på npm
                </a>
              </li>
              <li>
                <a
                  href="https://yml.publiccode.tools/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  publiccode.yml-standard
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200 pt-8 dark:border-slate-800 sm:flex-row">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Öppen källkod under MIT-licens. Bidra gärna!
          </p>
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/Cetriq/publiccode-tools"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
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
              className="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
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
