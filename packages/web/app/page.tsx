import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section - Big, bold, simple */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20" />
        <div className="relative mx-auto max-w-7xl px-4 py-32 sm:px-6 lg:px-8 lg:py-40">
          <div className="text-center">
            <p className="text-lg font-medium text-blue-400">
              För svenska myndigheter och kommuner
            </p>
            <h1 className="mt-4 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
              Dela programvara.
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Spara miljoner.
              </span>
            </h1>
            <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-slate-300">
              Varje år bygger svenska myndigheter samma system om och om igen.
              Vi hjälper er att hitta och dela öppen källkod med varandra.
            </p>
            <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/editor"
                className="group relative inline-flex items-center justify-center rounded-full bg-blue-500 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-blue-400 hover:shadow-lg hover:shadow-blue-500/25"
              >
                Kom igång gratis
                <svg className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link
                href="#hur-det-fungerar"
                className="inline-flex items-center justify-center rounded-full border border-slate-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:border-slate-500 hover:bg-slate-800"
              >
                Se hur det fungerar
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative gradient orbs */}
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-blue-500/30 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-cyan-500/30 blur-3xl" />
      </section>

      {/* Social proof */}
      <section className="border-b border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Byggt för den offentliga sektorns behov
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-slate-400 dark:text-slate-500">
            <span className="text-lg font-semibold">52 kategorier</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-lg font-semibold">Svenska och engelska</span>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <span className="text-lg font-semibold">100% öppen källkod</span>
          </div>
        </div>
      </section>

      {/* Problem/Solution - Emotional storytelling */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Sluta uppfinna hjulet
            </h2>
            <p className="mt-6 text-xl leading-relaxed text-slate-600 dark:text-slate-400">
              Hundratals svenska kommuner och myndigheter behöver samma typ av system:
              ärendehantering, dokument&shy;hantering, med&shy;borgar&shy;dialog.
              Men istället för att dela lösningar bygger var och en sitt eget.
            </p>
            <p className="mt-4 text-xl font-medium text-slate-900 dark:text-white">
              Det kostar skattebetalarna miljarder varje år.
            </p>
          </div>

          <div className="mt-20 grid gap-8 lg:grid-cols-3">
            <ProblemCard
              number="1"
              title="Samma problem, olika lösningar"
              description="290 kommuner löser ofta identiska utmaningar med helt separata system. Varje upphandling börjar från noll."
            />
            <ProblemCard
              number="2"
              title="Svårt att hitta rätt"
              description="Även när bra lösningar finns går de inte att hitta. Det saknas en gemensam plats där offentlig sektor kan dela med sig."
            />
            <ProblemCard
              number="3"
              title="Vi löser det"
              description="Genom att standardisera hur projekt beskrivs blir det enkelt att söka, jämföra och återanvända programvara."
              highlighted
            />
          </div>
        </div>
      </section>

      {/* How it works - Visual process */}
      <section id="hur-det-fungerar" className="bg-slate-50 py-24 dark:bg-slate-900 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Så fungerar det
            </h2>
            <p className="mt-6 text-xl text-slate-600 dark:text-slate-400">
              Tre enkla steg för att göra ert projekt sökbart och delbart
            </p>
          </div>

          <div className="mt-20 grid gap-12 lg:grid-cols-3">
            <StepCard
              step="1"
              title="Beskriv ert projekt"
              description="Använd vår visuella guide för att fylla i information om ert projekt. Namn, kategori, kontaktperson och vilka språk det stöder."
              icon={<EditIcon />}
            />
            <StepCard
              step="2"
              title="Exportera en fil"
              description="Vi skapar en liten textfil som beskriver projektet. Lägg den i ert kodarkiv så blir projektet automatiskt sökbart."
              icon={<FileIcon />}
            />
            <StepCard
              step="3"
              title="Dela och återanvänd"
              description="Nu kan andra myndigheter hitta ert projekt. Och ni kan hitta deras. Tillsammans bygger vi en katalog över svensk offentlig programvara."
              icon={<ShareIcon />}
            />
          </div>
        </div>
      </section>

      {/* Features - Clean, benefit-focused */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Verktyg som gör jobbet enkelt
            </h2>
            <p className="mt-6 text-xl text-slate-600 dark:text-slate-400">
              Oavsett om du är utvecklare eller beslutsfattare - vi har verktyg för dig
            </p>
          </div>

          <div className="mt-20 grid gap-8 lg:grid-cols-2">
            <FeatureCard
              title="Visuell redigerare"
              description="Skapa projektbeskrivningar utan att skriva kod. En steg-för-steg-guide som tar dig igenom hela processen på några minuter."
              benefits={[
                'Ingen teknisk kunskap krävs',
                'Alla fält förklaras på svenska',
                'Validering i realtid',
              ]}
              cta="Öppna redigeraren"
              ctaHref="/editor"
              gradient="from-blue-500 to-cyan-500"
            />
            <FeatureCard
              title="Kvalitetspoäng"
              description="Få direkt feedback på hur komplett er projektbeskrivning är. Vi visar exakt vad som saknas och hur ni kan förbättra."
              benefits={[
                'Poäng från 0 till 100',
                'Tydliga förbättringsförslag',
                'Prioriterade områden markeras',
              ]}
              cta="Se exempel"
              ctaHref="#score-demo"
              gradient="from-violet-500 to-purple-500"
            />
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <MiniFeatureCard
              icon={<CategoryIcon />}
              title="52 kategorier"
              description="Hitta rätt kategori för ert projekt bland allt från ärendehantering till dokumenthantering."
            />
            <MiniFeatureCard
              icon={<LanguageIcon />}
              title="Helt på svenska"
              description="Alla verktyg, felmeddelanden och kategoribeskrivningar finns på svenska."
            />
            <MiniFeatureCard
              icon={<OpenSourceIcon />}
              title="Öppen källkod"
              description="Alla våra verktyg är gratis och öppen källkod. Använd, modifiera och bidra."
            />
          </div>
        </div>
      </section>

      {/* Priority categories */}
      <section className="bg-slate-900 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
                Prioriterade områden
              </p>
              <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Nio kategorier som
                <br />
                Sverige satsar på först
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-300">
                Digital Infrastruktur för Samhällsservice har identifierat nio
                områden där delning av programvara kan ge störst effekt.
                Projekt inom dessa områden får extra synlighet.
              </p>
              <Link
                href="/editor"
                className="mt-8 inline-flex items-center text-lg font-semibold text-blue-400 hover:text-blue-300"
              >
                Registrera ert projekt
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {priorityCategories.map((cat) => (
                <div
                  key={cat.name}
                  className="rounded-xl border border-slate-700 bg-slate-800/50 p-5 backdrop-blur"
                >
                  <div className="text-2xl">{cat.emoji}</div>
                  <div className="mt-3 font-semibold text-white">
                    {cat.name}
                  </div>
                  <div className="mt-1 text-sm text-slate-400">
                    {cat.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* For developers section */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              För utvecklare
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Automatisera med våra verktyg
            </h2>
            <p className="mt-6 text-xl text-slate-600 dark:text-slate-400">
              Integrera validering i er utvecklingsprocess
            </p>
          </div>

          <div className="mx-auto mt-16 max-w-3xl">
            <div className="overflow-hidden rounded-2xl bg-slate-900 shadow-2xl">
              <div className="flex items-center gap-2 border-b border-slate-700 px-4 py-3">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="ml-4 text-sm text-slate-400">Terminal</span>
              </div>
              <div className="p-6">
                <div className="space-y-4 font-mono text-sm">
                  <div>
                    <span className="text-slate-500">$</span>
                    <span className="text-slate-300"> npm install -g @dis-tools/cli</span>
                  </div>
                  <div className="text-slate-500"># Skapa en ny projektbeskrivning</div>
                  <div>
                    <span className="text-slate-500">$</span>
                    <span className="text-slate-300"> pcode init</span>
                  </div>
                  <div className="text-slate-500"># Kontrollera kvaliteten</div>
                  <div>
                    <span className="text-slate-500">$</span>
                    <span className="text-slate-300"> pcode score --detailed</span>
                  </div>
                  <div className="mt-4 rounded-lg bg-slate-800 p-4">
                    <div className="text-green-400">Kvalitetspoäng: 85/100</div>
                    <div className="mt-2 text-slate-400">
                      ████████████████░░░░
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-6 text-center text-slate-600 dark:text-slate-400">
              Fungerar också som automatisk kontroll i er kodbas via GitHub
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Börja dela idag
            </h2>
            <p className="mt-6 text-xl text-blue-100">
              Det tar mindre än fem minuter att beskriva ert projekt.
              Tillsammans bygger vi framtidens offentliga digitala infrastruktur.
            </p>
            <Link
              href="/editor"
              className="mt-10 inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-lg font-semibold text-blue-600 shadow-lg transition-all hover:bg-blue-50 hover:shadow-xl"
            >
              Skapa projektbeskrivning
            </Link>
            <p className="mt-6 text-sm text-blue-200">
              Gratis och öppen källkod. Ingen registrering krävs.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

// Components

function ProblemCard({
  number,
  title,
  description,
  highlighted = false,
}: {
  number: string;
  title: string;
  description: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`relative rounded-2xl p-8 ${
        highlighted
          ? 'bg-blue-600 text-white'
          : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
      }`}
    >
      <div
        className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold ${
          highlighted
            ? 'bg-blue-500 text-white'
            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
        }`}
      >
        {number}
      </div>
      <h3
        className={`mt-4 text-xl font-semibold ${
          highlighted ? 'text-white' : 'text-slate-900 dark:text-white'
        }`}
      >
        {title}
      </h3>
      <p
        className={`mt-2 ${
          highlighted ? 'text-blue-100' : 'text-slate-600 dark:text-slate-400'
        }`}
      >
        {description}
      </p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
  icon,
}: {
  step: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">
        {icon}
      </div>
      <div className="mt-6">
        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
          Steg {step}
        </span>
        <h3 className="mt-2 text-xl font-semibold text-slate-900 dark:text-white">
          {title}
        </h3>
        <p className="mt-3 text-slate-600 dark:text-slate-400">{description}</p>
      </div>
    </div>
  );
}

function FeatureCard({
  title,
  description,
  benefits,
  cta,
  ctaHref,
  gradient,
}: {
  title: string;
  description: string;
  benefits: string[];
  cta: string;
  ctaHref: string;
  gradient: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-white p-8 shadow-xl dark:bg-slate-800 lg:p-10">
      <div
        className={`absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br ${gradient} opacity-20 blur-3xl`}
      />
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-4 text-slate-600 dark:text-slate-400">{description}</p>
      <ul className="mt-6 space-y-3">
        {benefits.map((benefit) => (
          <li key={benefit} className="flex items-center gap-3">
            <svg
              className="h-5 w-5 text-green-500"
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
            <span className="text-slate-700 dark:text-slate-300">{benefit}</span>
          </li>
        ))}
      </ul>
      <Link
        href={ctaHref}
        className="mt-8 inline-flex items-center font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400"
      >
        {cta}
        <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}

function MiniFeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}

const priorityCategories = [
  { name: 'Ärendehantering', description: 'System för att hantera ärenden och förfrågningar', emoji: '📋' },
  { name: 'Medborgarengagemang', description: 'Verktyg för dialog med medborgare', emoji: '🗣️' },
  { name: 'Dataanalys', description: 'Analysera och visualisera information', emoji: '📊' },
  { name: 'Dokumenthantering', description: 'Hantera och dela dokument', emoji: '📁' },
  { name: 'Identitetshantering', description: 'Inloggning och behörighetskontroll', emoji: '🔐' },
  { name: 'Kommunal förvaltning', description: 'System för kommunernas verksamhet', emoji: '🏛️' },
  { name: 'Medborgardeltagande', description: 'Samråd och demokratiska processer', emoji: '🤝' },
  { name: 'Felanmälan', description: 'Rapportera och spåra problem', emoji: '🔧' },
  { name: 'Arbetsflöden', description: 'Automatisera processer och rutiner', emoji: '⚡' },
];

// Icons
function EditIcon() {
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}

function CategoryIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}

function LanguageIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
    </svg>
  );
}

function OpenSourceIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  );
}
