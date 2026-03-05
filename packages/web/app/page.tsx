import Link from 'next/link';
import { Suspense } from 'react';
import CopyButton from '@/components/CopyButton';
import RecentUsers from '@/components/RecentUsers';

export const dynamic = 'force-dynamic';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero - Manifest style */}
      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-3 lg:gap-16">
            {/* Left side - Main content */}
            <div className="lg:col-span-2">
              {/* Beta badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500"></span>
                </span>
                <span className="text-sm font-medium text-amber-400">Beta</span>
                <span className="text-sm text-slate-400">— Vi bygger fortfarande</span>
              </div>

              <p className="text-sm font-semibold uppercase tracking-widest text-amber-500">
                En doktrin för svensk offentlig sektor
              </p>
              <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Varje kodrad ska kunna återanvändas av nästa kommun.
              </h1>
              <p className="mt-8 max-w-2xl text-xl leading-relaxed text-slate-400">
                SamhällsKodex är principen att all programvara som byggs för offentlig sektor
                ska beskrivas, delas och återanvändas. Inte som en möjlighet. Som en självklarhet.
              </p>
              <div className="mt-12 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/catalog"
                  className="inline-flex items-center justify-center rounded-none border-2 border-white bg-white px-8 py-4 text-lg font-bold text-slate-900 transition-all hover:bg-transparent hover:text-white"
                >
                  Se katalogen
                </Link>
                <Link
                  href="#principer"
                  className="inline-flex items-center justify-center rounded-none border-2 border-slate-700 px-8 py-4 text-lg font-bold text-white transition-all hover:border-white"
                >
                  Läs principerna
                </Link>
              </div>
            </div>

            {/* Right side - Recent users */}
            <div className="hidden lg:block">
              <Suspense fallback={<RecentUsersSkeleton />}>
                <RecentUsers />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Stark linje */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500" />
      </section>

      {/* Manifestet - tre principer */}
      <section id="principer" className="bg-slate-900 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              Tre principer
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              SamhällsKodex
            </h2>
          </div>

          <div className="mt-20 grid gap-0 border-t border-slate-700 lg:grid-cols-3">
            <PrincipleCard
              number="I"
              title="Beskriv"
              description="All programvara som utvecklas med offentliga medel ska ha en standardiserad beskrivning. Vad den gör. Vem som ansvarar. Hur den kan användas."
            />
            <PrincipleCard
              number="II"
              title="Dela"
              description="Beskrivningen ska vara offentlig och maskinläsbar. Andra ska kunna hitta, utvärdera och kontakta er utan hinder."
            />
            <PrincipleCard
              number="III"
              title="Återanvänd"
              description="Innan ny utveckling påbörjas ska befintliga lösningar undersökas. Låt oss dela och spara skattemedel."
            />
          </div>
        </div>
      </section>

      {/* Problemet - emotionell */}
      <section className="bg-slate-950 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              290 kommuner.<br />
              Samma problem.<br />
              <span className="text-slate-500">290 olika lösningar.</span>
            </h2>
            <div className="mt-12 space-y-6 text-lg leading-relaxed text-slate-400">
              <p>
                Varje år spenderar svenska kommuner och myndigheter miljarder kronor på
                IT-utveckling. Ärendehantering. Dokumenthantering. Medborgardialoger.
                Samma typer av system, om och om igen.
              </p>
              <p>
                Inte för att det saknas bra lösningar. Utan för att de inte går att hitta.
                Det finns ingen gemensam plats. Inget standardiserat sätt att beskriva vad
                som redan finns.
              </p>
              <p className="text-white font-semibold">
                SamhällsKodex ändrar det.
              </p>
              <p className="text-slate-400">
                En standard som redan används i flera länder inom Europeiska unionen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Standarden */}
      <section id="standarden" className="bg-slate-800 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
                Standarden
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                En fil. All information.
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-300">
                <code className="rounded bg-slate-700 px-2 py-1 font-mono text-sm">publiccode.yml</code> är
                en öppen standard för att beskriva programvara. En liten textfil i varje projekts
                kodarkiv som berättar vad projektet är, vem som står bakom det, och hur det kan användas.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-slate-300">
                Standarden kommer från Italien och används redan av tusentals europeiska
                offentliga projekt. SamhällsKodex anpassar den för svenska förhållanden
                med svenska kategorier, svenska felmeddelanden och fokus på svensk lagstiftning.
              </p>
              <Link
                href="/editor"
                className="mt-8 inline-flex items-center text-lg font-semibold text-white hover:text-slate-300"
              >
                Skapa er publiccode.yml
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>
            <div className="rounded-none bg-slate-900 p-6 lg:p-8">
              <div className="font-mono text-sm leading-relaxed text-slate-300">
                <div className="text-slate-500"># publiccode.yml</div>
                <div className="mt-4">
                  <span className="text-amber-400">publiccodeYmlVersion</span>: <span className="text-green-400">&quot;0.4&quot;</span>
                </div>
                <div>
                  <span className="text-amber-400">name</span>: <span className="text-green-400">&quot;Medborgarportalen&quot;</span>
                </div>
                <div>
                  <span className="text-amber-400">url</span>: <span className="text-green-400">&quot;https://github.com/...&quot;</span>
                </div>
                <div className="mt-4">
                  <span className="text-amber-400">description</span>:
                </div>
                <div className="pl-4">
                  <span className="text-amber-400">sv</span>:
                </div>
                <div className="pl-8">
                  <span className="text-amber-400">shortDescription</span>: <span className="text-green-400">&quot;Portal för medborgardialog&quot;</span>
                </div>
                <div className="mt-4">
                  <span className="text-amber-400">categories</span>:
                </div>
                <div className="pl-4">
                  <span className="text-green-400">- civic-engagement</span>
                </div>
                <div className="pl-4">
                  <span className="text-green-400">- public-participation</span>
                </div>
                <div className="mt-4">
                  <span className="text-amber-400">legal</span>:
                </div>
                <div className="pl-4">
                  <span className="text-amber-400">license</span>: <span className="text-green-400">&quot;EUPL-1.2&quot;</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prioriterade områden */}
      <section id="kategorier" className="bg-slate-900 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-slate-500">
              Fokusområden
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Nio områden med störst potential
            </h2>
            <p className="mt-6 text-lg text-slate-400">
              Regeringen har identifierat områden där delning av programvara kan ge störst samhällsnytta.
              Projekt inom dessa kategorier prioriteras i katalogen.
            </p>
          </div>

          <div className="mt-16 grid gap-px bg-slate-700 sm:grid-cols-2 lg:grid-cols-3">
            {priorityCategories.map((cat) => (
              <div key={cat.name} className="bg-slate-800 p-8">
                <div className="text-3xl">{cat.emoji}</div>
                <div className="mt-4 text-lg font-semibold text-white">{cat.name}</div>
                <div className="mt-2 text-slate-400">{cat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verktyg - kort sektion */}
      <section className="border-t border-slate-700 bg-slate-900 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Verktyg för att följa doktrinen
            </h2>
            <p className="mt-6 text-lg text-slate-400">
              Vi tillhandahåller verktyg som gör det enkelt att skapa, validera och publicera
              projektbeskrivningar enligt standarden.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            <ToolCard
              title="Webb-editor"
              description="Skapa publiccode.yml visuellt utan att skriva kod. En guide som tar dig igenom alla fält."
              cta="Öppna editorn"
              href="/editor"
            />
            <ToolCard
              title="Kommandoradsverktyg"
              description="Validera och poängsätt projektbeskrivningar direkt i terminalen. Perfekt för utvecklare."
              cta="npm install @samhallskodex/cli"
              href="https://www.npmjs.com/package/@samhallskodex/cli"
              mono
            />
            <ToolCard
              title="GitHub Action"
              description="Automatisk validering vid varje commit. Fel visas direkt i pull requests."
              cta="Se dokumentation"
              href="https://github.com/Cetriq/samhallskodex"
            />
          </div>
        </div>
      </section>

      {/* CLI demo */}
      <section className="bg-slate-950 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="overflow-hidden border border-slate-800">
              <div className="flex items-center gap-2 border-b border-slate-800 bg-slate-900 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="ml-4 font-mono text-sm text-slate-500">terminal</span>
              </div>
              <div className="bg-slate-950 p-6">
                <div className="space-y-4 font-mono text-sm">
                  <div className="group flex items-center">
                    <span className="text-slate-600">$</span>
                    <span className="ml-2 text-slate-300">npm install -g @samhallskodex/cli</span>
                    <CopyButton text="npm install -g @samhallskodex/cli" className="ml-2 opacity-0 group-hover:opacity-100" />
                  </div>
                  <div className="text-slate-600"># Validera ert projekt</div>
                  <div className="group flex items-center">
                    <span className="text-slate-600">$</span>
                    <span className="ml-2 text-slate-300">pcode score</span>
                    <CopyButton text="pcode score" className="ml-2 opacity-0 group-hover:opacity-100" />
                  </div>
                  <div className="mt-4 border-l-2 border-amber-500 bg-slate-900 p-4">
                    <div className="text-amber-500">SamhällsKodex Score: 72/100</div>
                    <div className="mt-2 text-slate-500">████████████████░░░░</div>
                    <div className="mt-4 text-slate-400">Förbättringar:</div>
                    <div className="text-slate-500">  + Lägg till screenshots (+10p)</div>
                    <div className="text-slate-500">  + Lägg till maintenance.contacts (+8p)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Avslutande CTA */}
      <section className="bg-slate-900 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Börja idag.
            </h2>
            <p className="mt-6 text-xl text-slate-400">
              Det tar fem minuter att beskriva ert projekt. Varje beskrivning
              som läggs till gör det enklare för nästa kommun att hitta rätt.
            </p>
            <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Link
                href="/kom-igang"
                className="inline-flex items-center justify-center border-2 border-white bg-white px-8 py-4 text-lg font-bold text-slate-900 transition-all hover:bg-transparent hover:text-white"
              >
                Kom igång
              </Link>
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center border-2 border-slate-700 px-8 py-4 text-lg font-bold text-white transition-all hover:border-white"
              >
                Bläddra i katalogen
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Components

function PrincipleCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="border-b border-slate-700 p-8 lg:border-b-0 lg:border-r lg:p-12 last:border-r-0">
      <div className="font-mono text-4xl font-bold text-slate-600">{number}</div>
      <h3 className="mt-6 text-2xl font-bold text-white">{title}</h3>
      <p className="mt-4 leading-relaxed text-slate-400">{description}</p>
    </div>
  );
}

function ToolCard({
  title,
  description,
  cta,
  href,
  mono = false,
}: {
  title: string;
  description: string;
  cta: string;
  href: string;
  mono?: boolean;
}) {
  return (
    <div className="border border-slate-700 p-8">
      <h3 className="text-xl font-bold text-white">{title}</h3>
      <p className="mt-4 text-slate-400">{description}</p>
      <Link
        href={href}
        className={`mt-6 inline-flex items-center font-semibold text-white hover:text-slate-300 ${mono ? 'font-mono text-sm' : ''}`}
      >
        {cta}
        <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </Link>
    </div>
  );
}

const priorityCategories = [
  { name: 'Ärendehantering', description: 'Hantera ärenden och förfrågningar systematiskt', emoji: '📋' },
  { name: 'Medborgarengagemang', description: 'Dialog mellan kommun och medborgare', emoji: '🗣️' },
  { name: 'Dataanalys', description: 'Analysera och visualisera offentlig data', emoji: '📊' },
  { name: 'Dokumenthantering', description: 'Strukturerad hantering av dokument', emoji: '📁' },
  { name: 'Identitetshantering', description: 'Inloggning och behörighetskontroll', emoji: '🔐' },
  { name: 'Kommunal förvaltning', description: 'System för kommunernas kärnverksamhet', emoji: '🏛️' },
  { name: 'Medborgardeltagande', description: 'Demokratiska processer och samråd', emoji: '🤝' },
  { name: 'Felanmälan', description: 'Rapportera och hantera incidenter', emoji: '🔧' },
  { name: 'Arbetsflöden', description: 'Automatisering av administrativa processer', emoji: '⚡' },
];

function RecentUsersSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-6 backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-4 w-28 animate-pulse rounded bg-slate-700" />
        <div className="h-3 w-16 animate-pulse rounded bg-slate-700" />
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-3">
            <div className="h-10 w-10 animate-pulse rounded-full bg-slate-700" />
            <div className="flex-1">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-700" />
              <div className="mt-1 h-3 w-16 animate-pulse rounded bg-slate-700" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
