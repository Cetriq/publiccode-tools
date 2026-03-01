import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Om SamhällsKodex',
  description: 'Om projektet, visionen och teamet bakom SamhällsKodex.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-24 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Om SamhällsKodex
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            Ett initiativ för att göra offentlig programvara synlig och delbar
          </p>
        </div>

        {/* Story */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-white">Bakgrund</h2>
          <div className="mt-6 space-y-4 text-slate-300 leading-relaxed">
            <p>
              SamhällsKodex startade som ett experiment: Kan man på en helg bygga en komplett
              verktygskedja för att hjälpa svensk offentlig sektor beskriva och dela sin programvara?
            </p>
            <p>
              Svaret visade sig vara ja. Med hjälp av modern AI-assisterad kodning gick det att
              på rekordtid ta fram validering, poängsättning, webb-editor, CLI-verktyg och
              GitHub Action &ndash; allt byggt på den europeiska standarden publiccode.yml.
            </p>
            <p>
              Projektet visar vad som är möjligt när man kombinerar öppen källkod,
              befintliga standarder och nya verktyg för mjukvaruutveckling.
            </p>
          </div>
        </section>

        {/* Built with AI */}
        <section className="mt-16 rounded-2xl bg-white/5 p-8 backdrop-blur">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-500">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Byggt med AI-assisterad kodning</h3>
              <p className="mt-2 text-slate-400">
                Hela denna plattform &ndash; från validering och poängsättning till webb-editor
                och CLI &ndash; är utvecklad med hjälp av Claude Code, Anthropics AI-kodassistent.
                Det som tidigare kunde ta veckor eller månader tog istället en helg.
              </p>
            </div>
          </div>
        </section>

        {/* Creator */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-white">Skapare</h2>
          <div className="mt-6 flex items-start gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-2xl font-bold text-white">
              CT
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Clas Törnquist</h3>
              <p className="text-slate-400">CETRIQ</p>
              <p className="mt-3 text-slate-300">
                Utvecklare och entreprenör med passion för öppen källkod och offentlig digital infrastruktur.
              </p>
              <a
                href="https://www.linkedin.com/in/clastornquist"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                LinkedIn-profil
              </a>
            </div>
          </div>
        </section>

        {/* Roadmap */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-white">Kommande funktioner</h2>
          <p className="mt-4 text-slate-400">
            SamhällsKodex är under aktiv utveckling. Här är några av de funktioner vi planerar:
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <RoadmapItem
              title="Kommuninloggning"
              description="Inloggning med kommunala e-postadresser för att verifiera och hantera projekt."
              status="in-progress"
            />
            <RoadmapItem
              title="Organisationsprofiler"
              description="Dedikerade sidor för kommuner och myndigheter med alla deras projekt."
              status="planned"
            />
            <RoadmapItem
              title="Projektkommentarer"
              description="Möjlighet att diskutera och ställa frågor om specifika projekt."
              status="planned"
            />
            <RoadmapItem
              title="Automatisk upptäckt"
              description="Skanna GitHub-organisationer efter projekt med publiccode.yml."
              status="planned"
            />
            <RoadmapItem
              title="API för integration"
              description="Öppet API för att integrera katalogen i andra system."
              status="planned"
            />
            <RoadmapItem
              title="Statistik och trender"
              description="Visualisera tillväxt och användning av öppen programvara i offentlig sektor."
              status="planned"
            />
          </div>
        </section>

        {/* Tech stack */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-white">Teknisk stack</h2>
          <div className="mt-6 flex flex-wrap gap-3">
            {[
              'Next.js 14',
              'TypeScript',
              'Tailwind CSS',
              'Firebase',
              'Vercel',
              'pnpm',
              'Turborepo',
            ].map((tech) => (
              <span
                key={tech}
                className="rounded-full bg-slate-700/50 px-4 py-2 text-sm text-slate-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Open source */}
        <section className="mt-16 rounded-2xl border border-slate-700 bg-slate-800/50 p-8">
          <h2 className="text-2xl font-bold text-white">Öppen källkod</h2>
          <p className="mt-4 text-slate-300">
            SamhällsKodex är helt öppen källkod under Apache-2.0-licens.
            Bidrag, förslag och feedback är varmt välkomna.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <a
              href="https://github.com/Cetriq/publiccode-tools"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-slate-900 transition hover:bg-slate-100"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              Se källkoden på GitHub
            </a>
            <Link
              href="/editor"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-6 py-3 font-semibold text-white transition hover:bg-slate-700"
            >
              Testa editorn
            </Link>
          </div>
        </section>

        {/* Contact */}
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-white text-center">Kontakt</h2>
          <p className="mt-4 text-slate-400 text-center">
            Har du frågor, förslag eller vill samarbeta? Hör av dig!
          </p>
          <form
            action="https://formspree.io/f/xlgwvqol"
            method="POST"
            className="mt-8 mx-auto max-w-md space-y-4"
          >
            <input
              type="email"
              name="email"
              placeholder="Din e-postadress"
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <textarea
              name="message"
              placeholder="Ditt meddelande"
              required
              rows={4}
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
            />
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-500"
            >
              Skicka meddelande
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}

function RoadmapItem({
  title,
  description,
  status,
}: {
  title: string;
  description: string;
  status: 'done' | 'in-progress' | 'planned';
}) {
  const statusStyles = {
    done: 'bg-emerald-500/20 text-emerald-400',
    'in-progress': 'bg-amber-500/20 text-amber-400',
    planned: 'bg-slate-500/20 text-slate-400',
  };

  const statusLabels = {
    done: 'Klart',
    'in-progress': 'Pågår',
    planned: 'Planerat',
  };

  return (
    <div className="rounded-xl bg-white/5 p-5 backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-semibold text-white">{title}</h3>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[status]}`}>
          {statusLabels[status]}
        </span>
      </div>
      <p className="mt-2 text-sm text-slate-400">{description}</p>
    </div>
  );
}
