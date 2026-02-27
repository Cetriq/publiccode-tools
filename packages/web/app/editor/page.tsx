'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

// Score calculation
interface ScoreBreakdown {
  total: number;
  categories: {
    name: string;
    score: number;
    maxScore: number;
    items: Array<{ label: string; fulfilled: boolean; points: number }>;
  }[];
}

function calculateScore(data: PubliccodeData): ScoreBreakdown {
  const categories: ScoreBreakdown['categories'] = [];

  // Category 1: Basic Information (25 points)
  const basicItems = [
    { label: 'Projektnamn', fulfilled: !!data.name, points: 8 },
    { label: 'Kodarkiv (URL)', fulfilled: !!data.url, points: 8 },
    { label: 'Utvecklingsstatus', fulfilled: !!data.developmentStatus, points: 5 },
    { label: 'Kategorier', fulfilled: data.categories.length > 0, points: 4 },
  ];
  categories.push({
    name: 'Grundinformation',
    score: basicItems.filter(i => i.fulfilled).reduce((sum, i) => sum + i.points, 0),
    maxScore: 25,
    items: basicItems,
  });

  // Category 2: Description (25 points)
  const descItems = [
    { label: 'Kort beskrivning', fulfilled: !!(data.description.sv?.shortDescription), points: 10 },
    { label: 'Lång beskrivning', fulfilled: !!(data.description.sv?.longDescription && data.description.sv.longDescription.length > 50), points: 10 },
    { label: 'Funktioner', fulfilled: !!(data.description.sv?.features && data.description.sv.features.length > 0), points: 5 },
  ];
  categories.push({
    name: 'Beskrivning',
    score: descItems.filter(i => i.fulfilled).reduce((sum, i) => sum + i.points, 0),
    maxScore: 25,
    items: descItems,
  });

  // Category 3: Legal (20 points)
  const legalItems = [
    { label: 'Licens', fulfilled: !!data.legal.license, points: 15 },
    { label: 'Ägare', fulfilled: !!data.legal.repoOwner, points: 5 },
  ];
  categories.push({
    name: 'Juridik',
    score: legalItems.filter(i => i.fulfilled).reduce((sum, i) => sum + i.points, 0),
    maxScore: 20,
    items: legalItems,
  });

  // Category 4: Maintenance (20 points)
  const maintItems = [
    { label: 'Underhållstyp', fulfilled: !!data.maintenance.type, points: 5 },
    { label: 'Kontaktperson namn', fulfilled: !!data.maintenance.contacts[0]?.name, points: 10 },
    { label: 'Kontakt e-post', fulfilled: !!data.maintenance.contacts[0]?.email, points: 5 },
  ];
  categories.push({
    name: 'Underhåll',
    score: maintItems.filter(i => i.fulfilled).reduce((sum, i) => sum + i.points, 0),
    maxScore: 20,
    items: maintItems,
  });

  // Category 5: Swedish extras (10 points)
  const priorityCategories = ['case-management', 'civic-engagement', 'data-analytics', 'document-management', 'identity', 'local-government', 'participation', 'reporting', 'workflow-automation'];
  const hasPriorityCategory = data.categories.some(c => priorityCategories.includes(c));
  const sweItems = [
    { label: 'Svensk beskrivning', fulfilled: !!(data.description.sv?.shortDescription), points: 3 },
    { label: 'DIS Fas 1-projekt', fulfilled: data.sv?.disFas1 === true, points: 4 },
    { label: 'Prioriterad kategori', fulfilled: hasPriorityCategory, points: 3 },
  ];
  categories.push({
    name: 'Sverige-specifikt',
    score: sweItems.filter(i => i.fulfilled).reduce((sum, i) => sum + i.points, 0),
    maxScore: 10,
    items: sweItems,
  });

  const total = categories.reduce((sum, c) => sum + c.score, 0);

  return { total, categories };
}

// Types for publiccode.yml
interface PubliccodeData {
  publiccodeYmlVersion: string;
  name: string;
  url: string;
  releaseDate: string;
  softwareVersion: string;
  platforms: string[];
  categories: string[];
  developmentStatus: string;
  softwareType: string;
  description: {
    sv?: {
      localisedName?: string;
      shortDescription: string;
      longDescription?: string;
      features?: string[];
    };
    en?: {
      localisedName?: string;
      shortDescription: string;
      longDescription?: string;
      features?: string[];
    };
  };
  legal: {
    license: string;
    repoOwner?: string;
  };
  maintenance: {
    type: string;
    contacts: Array<{
      name: string;
      email?: string;
      phone?: string;
    }>;
  };
  localisation: {
    localisationReady: boolean;
    availableLanguages: string[];
  };
  it?: {
    ripiattaforme?: {
      national?: boolean;
      regional?: boolean;
    };
    countryExtensionVersion: string;
  };
  sv?: {
    countryExtensionVersion: string;
    disFas1: boolean;
  };
}

const initialData: PubliccodeData = {
  publiccodeYmlVersion: '0.3',
  name: '',
  url: '',
  releaseDate: new Date().toISOString().split('T')[0],
  softwareVersion: '',
  platforms: ['web'],
  categories: [],
  developmentStatus: '',
  softwareType: 'standalone/web',
  description: {
    sv: {
      shortDescription: '',
      longDescription: '',
      features: [],
    },
  },
  legal: {
    license: '',
  },
  maintenance: {
    type: '',
    contacts: [{ name: '', email: '' }],
  },
  localisation: {
    localisationReady: false,
    availableLanguages: ['sv'],
  },
  sv: {
    countryExtensionVersion: '1.0',
    disFas1: false,
  },
};

const steps = [
  { id: 1, name: 'Grundinfo', description: 'Namn och webbadress' },
  { id: 2, name: 'Kategori', description: 'Välj typ av programvara' },
  { id: 3, name: 'Beskrivning', description: 'Beskriv vad den gör' },
  { id: 4, name: 'Licens', description: 'Juridisk information' },
  { id: 5, name: 'Underhåll', description: 'Kontaktperson' },
  { id: 6, name: 'Exportera', description: 'Ladda ner filen' },
];

const categoryOptions = [
  { value: 'case-management', label: 'Ärendehantering', description: 'System för att hantera ärenden och förfrågningar', priority: true },
  { value: 'civic-engagement', label: 'Medborgarengagemang', description: 'Verktyg för dialog med medborgare', priority: true },
  { value: 'data-analytics', label: 'Dataanalys', description: 'Analysera och visualisera information', priority: true },
  { value: 'document-management', label: 'Dokumenthantering', description: 'Hantera och dela dokument', priority: true },
  { value: 'identity', label: 'Identitetshantering', description: 'Inloggning och behörighetskontroll', priority: true },
  { value: 'local-government', label: 'Kommunal förvaltning', description: 'System för kommunernas verksamhet', priority: true },
  { value: 'participation', label: 'Medborgardeltagande', description: 'Samråd och demokratiska processer', priority: true },
  { value: 'reporting', label: 'Felanmälan', description: 'Rapportera och spåra problem', priority: true },
  { value: 'workflow-automation', label: 'Arbetsflöden', description: 'Automatisera processer och rutiner', priority: true },
  { value: 'accounting', label: 'Bokföring', description: 'Ekonomisystem och fakturahantering' },
  { value: 'collaboration', label: 'Samarbete', description: 'Verktyg för teamarbete' },
  { value: 'communications', label: 'Kommunikation', description: 'E-post, chatt och meddelanden' },
  { value: 'crm', label: 'Kundrelationer', description: 'Hantera relationer och kontakter' },
  { value: 'content-management', label: 'Innehållshantering', description: 'Webbplatser och publicering' },
  { value: 'database', label: 'Databas', description: 'Lagra och organisera data' },
  { value: 'education', label: 'Utbildning', description: 'Lärplattformar och kurser' },
  { value: 'gis', label: 'Geografiska system', description: 'Kartor och platsdata' },
  { value: 'hr', label: 'Personal', description: 'Personaladministration och rekrytering' },
  { value: 'it-development', label: 'Utveckling', description: 'Verktyg för programutveckling' },
  { value: 'it-security', label: 'IT-säkerhet', description: 'Skydda system och data' },
];

const licenseOptions = [
  { value: 'MIT', label: 'MIT', description: 'Enkel och tillåtande licens. Populär för öppen källkod.' },
  { value: 'Apache-2.0', label: 'Apache 2.0', description: 'Tillåtande med patentskydd. Används av många stora projekt.' },
  { value: 'GPL-3.0-only', label: 'GPL 3.0', description: 'Copyleft-licens. Ändringar måste också vara öppen källkod.' },
  { value: 'LGPL-3.0-only', label: 'LGPL 3.0', description: 'Svagare copyleft. Bra för bibliotek.' },
  { value: 'EUPL-1.2', label: 'EUPL 1.2', description: 'EU:s officiella licens för offentlig sektor.' },
  { value: 'CC0-1.0', label: 'CC0 (Public Domain)', description: 'Inga restriktioner. Fullt fri användning.' },
  { value: 'BSD-3-Clause', label: 'BSD 3-Clause', description: 'Tillåtande med attributionskrav.' },
];

const developmentStatusOptions = [
  { value: 'concept', label: 'Koncept', description: 'Tidig idéfas, ingen kod än' },
  { value: 'development', label: 'Under utveckling', description: 'Aktiv utveckling pågår' },
  { value: 'beta', label: 'Beta', description: 'Redo för testning, men inte helt färdig' },
  { value: 'stable', label: 'Stabil', description: 'Redo för produktionsanvändning' },
  { value: 'obsolete', label: 'Föråldrad', description: 'Underhålls inte längre' },
];

const maintenanceTypeOptions = [
  { value: 'internal', label: 'Intern', description: 'Underhålls av organisationen själv' },
  { value: 'contract', label: 'Kontrakt', description: 'Underhålls av extern leverantör' },
  { value: 'community', label: 'Community', description: 'Underhålls av frivilliga bidragsgivare' },
  { value: 'none', label: 'Inget', description: 'Underhålls inte aktivt' },
];

export default function EditorPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<PubliccodeData>(initialData);
  const [showYaml, setShowYaml] = useState(false);
  const [showScore, setShowScore] = useState(true);

  const scoreBreakdown = useMemo(() => calculateScore(data), [data]);

  const updateData = (path: string, value: unknown) => {
    setData((prev) => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current: Record<string, unknown> = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in current)) {
          current[key] = {};
        }
        current = current[key] as Record<string, unknown>;
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateYaml = (): string => {
    const cleanData = JSON.parse(JSON.stringify(data));

    // Remove empty values
    const removeEmpty = (obj: Record<string, unknown>): Record<string, unknown> => {
      const result: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (value === null || value === undefined || value === '') continue;
        if (Array.isArray(value) && value.length === 0) continue;
        if (typeof value === 'object' && !Array.isArray(value)) {
          const cleaned = removeEmpty(value as Record<string, unknown>);
          if (Object.keys(cleaned).length > 0) {
            result[key] = cleaned;
          }
        } else {
          result[key] = value;
        }
      }
      return result;
    };

    const cleaned = removeEmpty(cleanData);
    return toYaml(cleaned, 0);
  };

  const toYaml = (obj: unknown, indent: number): string => {
    const spaces = '  '.repeat(indent);

    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      return obj.map((item) => {
        if (typeof item === 'object' && item !== null) {
          const lines = toYaml(item, indent + 1).split('\n');
          return `${spaces}- ${lines[0].trim()}\n${lines.slice(1).map(l => spaces + '  ' + l.trim()).join('\n')}`.trimEnd();
        }
        return `${spaces}- ${item}`;
      }).join('\n');
    }

    if (typeof obj === 'object' && obj !== null) {
      return Object.entries(obj as Record<string, unknown>)
        .map(([key, value]) => {
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            return `${spaces}${key}:\n${toYaml(value, indent + 1)}`;
          }
          if (Array.isArray(value)) {
            if (value.length === 0) return `${spaces}${key}: []`;
            if (typeof value[0] === 'string') {
              return `${spaces}${key}:\n${value.map(v => `${spaces}  - ${v}`).join('\n')}`;
            }
            return `${spaces}${key}:\n${toYaml(value, indent + 1)}`;
          }
          if (typeof value === 'boolean') {
            return `${spaces}${key}: ${value}`;
          }
          if (typeof value === 'string' && (value.includes(':') || value.includes('#') || value.includes('\n'))) {
            return `${spaces}${key}: "${value}"`;
          }
          return `${spaces}${key}: ${value}`;
        })
        .join('\n');
    }

    return String(obj);
  };

  const downloadYaml = () => {
    const yaml = generateYaml();
    const blob = new Blob([yaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'publiccode.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    const yaml = generateYaml();
    navigator.clipboard.writeText(yaml);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Header - matches landing page style */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20" />
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-cyan-500/20 blur-3xl" />

        <div className="relative mx-auto max-w-5xl px-4 pb-8 pt-28 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Tillbaka till startsidan
          </Link>

          <div className="mt-6 flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Skapa projektbeskrivning
              </h1>
              <p className="mt-2 text-lg text-slate-300">
                Fyll i informationen steg för steg
              </p>
            </div>

            {/* Live score badge */}
            <div className="hidden items-center gap-3 rounded-full bg-white/10 px-5 py-2.5 backdrop-blur sm:flex">
              <div className="flex items-center gap-2">
                <div
                  className={`h-3 w-3 rounded-full ${
                    scoreBreakdown.total >= 80 ? 'bg-green-400' :
                    scoreBreakdown.total >= 50 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                />
                <span className="text-sm font-medium text-white">
                  {scoreBreakdown.total}/100 poäng
                </span>
              </div>
              <button
                onClick={() => setShowYaml(!showYaml)}
                className="text-sm text-slate-300 transition-colors hover:text-white"
              >
                {showYaml ? 'Dölj YAML' : 'Visa YAML'}
              </button>
            </div>
          </div>

          {/* Progress steps - redesigned */}
          <nav className="mt-10">
            <ol className="flex items-center">
              {steps.map((step, index) => (
                <li key={step.id} className="flex flex-1 items-center">
                  <button
                    onClick={() => setCurrentStep(step.id)}
                    className="group flex flex-col items-center"
                  >
                    <span
                      className={`relative flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold transition-all ${
                        currentStep === step.id
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50 ring-4 ring-blue-500/20'
                          : currentStep > step.id
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-700 text-slate-400 group-hover:bg-slate-600'
                      }`}
                    >
                      {currentStep > step.id ? (
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        step.id
                      )}
                    </span>
                    <span className={`mt-3 hidden text-xs font-semibold sm:block ${
                      currentStep === step.id ? 'text-white' :
                      currentStep > step.id ? 'text-green-400' : 'text-slate-500'
                    }`}>
                      {step.name}
                    </span>
                  </button>
                  {index < steps.length - 1 && (
                    <div
                      className={`mx-1 h-1 flex-1 rounded-full transition-all sm:mx-2 ${
                        currentStep > step.id
                          ? 'bg-green-500'
                          : 'bg-slate-700'
                      }`}
                    />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Form - takes 3 of 5 columns */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900 lg:col-span-3">
            {/* Decorative gradient */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-3xl" />
            {currentStep === 1 && (
              <Step1
                data={data}
                updateData={updateData}
                developmentStatusOptions={developmentStatusOptions}
              />
            )}
            {currentStep === 2 && (
              <Step2
                data={data}
                updateData={updateData}
                categoryOptions={categoryOptions}
              />
            )}
            {currentStep === 3 && (
              <Step3 data={data} updateData={updateData} />
            )}
            {currentStep === 4 && (
              <Step4
                data={data}
                updateData={updateData}
                licenseOptions={licenseOptions}
              />
            )}
            {currentStep === 5 && (
              <Step5
                data={data}
                updateData={updateData}
                maintenanceTypeOptions={maintenanceTypeOptions}
              />
            )}
            {currentStep === 6 && (
              <Step6
                yaml={generateYaml()}
                onDownload={downloadYaml}
                onCopy={copyToClipboard}
              />
            )}

            {/* Navigation */}
            <div className="relative mt-10 flex items-center justify-between border-t border-slate-200 pt-8 dark:border-slate-800">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="group inline-flex items-center gap-2 rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
              >
                <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Föregående
              </button>

              {/* Step indicator for mobile */}
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400 sm:hidden">
                {currentStep} / {steps.length}
              </span>

              {currentStep < steps.length ? (
                <button
                  onClick={nextStep}
                  className="group inline-flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 hover:shadow-xl hover:shadow-blue-500/30"
                >
                  Nästa steg
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={downloadYaml}
                  className="group inline-flex items-center gap-2 rounded-full bg-green-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-green-500/25 transition-all hover:bg-green-400 hover:shadow-xl hover:shadow-green-500/30"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Ladda ner fil
                </button>
              )}
            </div>
          </div>

          {/* Sidebar - Score and YAML Preview - takes 2 of 5 columns */}
          <div className="space-y-6 lg:col-span-2">
            {/* Score Panel - Always visible, redesigned */}
            {showScore && (
              <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-green-500/10 to-emerald-500/10 blur-2xl" />

                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Kvalitetspoäng
                  </h3>
                  <button
                    onClick={() => setShowScore(false)}
                    className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Main score - larger, more prominent */}
                <div className="mt-6 text-center">
                  <div className="relative mx-auto h-36 w-36">
                    <svg className="h-36 w-36 -rotate-90 transform">
                      <circle
                        cx="72"
                        cy="72"
                        r="64"
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="none"
                        className="text-slate-100 dark:text-slate-800"
                      />
                      <circle
                        cx="72"
                        cy="72"
                        r="64"
                        stroke="currentColor"
                        strokeWidth="10"
                        fill="none"
                        strokeDasharray={`${(scoreBreakdown.total / 100) * 402} 402`}
                        strokeLinecap="round"
                        className={`transition-all duration-500 ${
                          scoreBreakdown.total >= 80
                            ? 'text-green-500'
                            : scoreBreakdown.total >= 50
                            ? 'text-amber-500'
                            : 'text-red-500'
                        }`}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-4xl font-bold ${
                        scoreBreakdown.total >= 80 ? 'text-green-600 dark:text-green-400' :
                        scoreBreakdown.total >= 50 ? 'text-amber-600 dark:text-amber-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {scoreBreakdown.total}
                      </span>
                      <span className="text-xs font-medium text-slate-500">av 100</span>
                    </div>
                  </div>
                  <p className={`mt-3 text-sm font-semibold ${
                    scoreBreakdown.total >= 80 ? 'text-green-600 dark:text-green-400' :
                    scoreBreakdown.total >= 50 ? 'text-amber-600 dark:text-amber-400' :
                    'text-slate-600 dark:text-slate-400'
                  }`}>
                    {scoreBreakdown.total >= 80
                      ? 'Utmärkt! Redo att delas'
                      : scoreBreakdown.total >= 50
                      ? 'Bra start, fyll i mer'
                      : 'Fyll i grundläggande info'}
                  </p>
                </div>

                {/* Category breakdown - cleaner */}
                <div className="mt-6 space-y-3">
                  {scoreBreakdown.categories.map((cat) => (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{cat.name}</span>
                        <span className={`font-bold ${
                          cat.score === cat.maxScore ? 'text-green-600 dark:text-green-400' :
                          cat.score > 0 ? 'text-blue-600 dark:text-blue-400' :
                          'text-slate-400'
                        }`}>
                          {cat.score}/{cat.maxScore}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            cat.score === cat.maxScore
                              ? 'bg-green-500'
                              : cat.score > 0
                              ? 'bg-blue-500'
                              : 'bg-slate-200 dark:bg-slate-700'
                          }`}
                          style={{ width: `${(cat.score / cat.maxScore) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Missing items hint - styled as tips */}
                {scoreBreakdown.total < 100 && (
                  <div className="mt-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-4 dark:from-slate-800 dark:to-slate-800/50">
                    <p className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Snabba vinster
                    </p>
                    <ul className="mt-3 space-y-2">
                      {scoreBreakdown.categories
                        .flatMap((cat) => cat.items.filter((i) => !i.fulfilled))
                        .slice(0, 3)
                        .map((item, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-xs"
                          >
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 font-bold text-amber-700 dark:bg-amber-900/50 dark:text-amber-400">
                              +{item.points}
                            </span>
                            <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* YAML Preview - redesigned */}
            {showYaml && (
              <div className="overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-700 px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      <div className="h-3 w-3 rounded-full bg-red-500" />
                      <div className="h-3 w-3 rounded-full bg-yellow-500" />
                      <div className="h-3 w-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-xs font-medium text-slate-400">publiccode.yml</span>
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
                  >
                    Kopiera
                  </button>
                </div>
                <pre className="max-h-64 overflow-auto p-5 text-xs leading-relaxed text-slate-300">
                  {generateYaml()}
                </pre>
              </div>
            )}

            {/* Show score button if hidden */}
            {!showScore && (
              <button
                onClick={() => setShowScore(true)}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600"
              >
                <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Visa kvalitetspoäng
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step Components

function Step1({
  data,
  updateData,
  developmentStatusOptions,
}: {
  data: PubliccodeData;
  updateData: (path: string, value: unknown) => void;
  developmentStatusOptions: Array<{ value: string; label: string; description: string }>;
}) {
  return (
    <div className="relative space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Steg 1 av 6
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Grundläggande information
        </h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Berätta vad projektet heter och var det finns
        </p>
      </div>

      <div>
        <label className="label">Projektnamn *</label>
        <input
          type="text"
          value={data.name}
          onChange={(e) => updateData('name', e.target.value)}
          placeholder="t.ex. Mitt Ärendehanteringssystem"
          className="input"
        />
        <p className="mt-1 text-xs text-slate-500">
          Det officiella namnet på programvaran
        </p>
      </div>

      <div>
        <label className="label">Kodarkiv (URL) *</label>
        <input
          type="url"
          value={data.url}
          onChange={(e) => updateData('url', e.target.value)}
          placeholder="https://github.com/organisation/projekt"
          className="input"
        />
        <p className="mt-1 text-xs text-slate-500">
          Länk till där källkoden finns, t.ex. GitHub eller GitLab
        </p>
      </div>

      <div>
        <label className="label">Utvecklingsstatus *</label>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {developmentStatusOptions.map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                data.developmentStatus === option.value
                  ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
              }`}
            >
              <input
                type="radio"
                name="developmentStatus"
                value={option.value}
                checked={data.developmentStatus === option.value}
                onChange={(e) => updateData('developmentStatus', e.target.value)}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-slate-900 dark:text-white">
                  {option.label}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {option.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step2({
  data,
  updateData,
  categoryOptions,
}: {
  data: PubliccodeData;
  updateData: (path: string, value: unknown) => void;
  categoryOptions: Array<{ value: string; label: string; description: string; priority?: boolean }>;
}) {
  return (
    <div className="relative space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Steg 2 av 6
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Kategorier
        </h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Välj en eller flera kategorier som beskriver vad programvaran gör
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            Prioriterade områden (DIS Fas 1)
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Projekt inom dessa områden får extra synlighet
          </p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {categoryOptions
            .filter((c) => c.priority)
            .map((category) => (
              <label
                key={category.value}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                  data.categories.includes(category.value)
                    ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={data.categories.includes(category.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateData('categories', [...data.categories, category.value]);
                    } else {
                      updateData('categories', data.categories.filter((c) => c !== category.value));
                    }
                  }}
                  className="mt-0.5"
                />
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {category.label}
                  </div>
                  <div className="text-xs text-slate-500">{category.description}</div>
                </div>
              </label>
            ))}
        </div>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
          Övriga kategorier
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {categoryOptions
            .filter((c) => !c.priority)
            .map((category) => (
              <label
                key={category.value}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                  data.categories.includes(category.value)
                    ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                    : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
                }`}
              >
                <input
                  type="checkbox"
                  checked={data.categories.includes(category.value)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      updateData('categories', [...data.categories, category.value]);
                    } else {
                      updateData('categories', data.categories.filter((c) => c !== category.value));
                    }
                  }}
                  className="mt-0.5"
                />
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-white">
                    {category.label}
                  </div>
                  <div className="text-xs text-slate-500">{category.description}</div>
                </div>
              </label>
            ))}
        </div>
      </div>
    </div>
  );
}

function Step3({
  data,
  updateData,
}: {
  data: PubliccodeData;
  updateData: (path: string, value: unknown) => void;
}) {
  const [featureInput, setFeatureInput] = useState('');

  const addFeature = () => {
    if (featureInput.trim()) {
      const currentFeatures = data.description.sv?.features || [];
      updateData('description.sv.features', [...currentFeatures, featureInput.trim()]);
      setFeatureInput('');
    }
  };

  const removeFeature = (index: number) => {
    const currentFeatures = data.description.sv?.features || [];
    updateData('description.sv.features', currentFeatures.filter((_, i) => i !== index));
  };

  return (
    <div className="relative space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Steg 3 av 6
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Beskrivning
        </h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Hjälp andra förstå vad programvaran gör
        </p>
      </div>

      <div>
        <label className="label">Kort beskrivning (svenska) *</label>
        <input
          type="text"
          value={data.description.sv?.shortDescription || ''}
          onChange={(e) => updateData('description.sv.shortDescription', e.target.value)}
          placeholder="En mening som sammanfattar vad programvaran gör"
          maxLength={150}
          className="input"
        />
        <p className="mt-1 text-xs text-slate-500">
          Max 150 tecken. Detta visas i sökresultat.
        </p>
      </div>

      <div>
        <label className="label">Lång beskrivning (svenska)</label>
        <textarea
          value={data.description.sv?.longDescription || ''}
          onChange={(e) => updateData('description.sv.longDescription', e.target.value)}
          placeholder="Beskriv programvaran mer utförligt. Vad gör den? Vilka problem löser den? Vem är målgruppen?"
          rows={6}
          className="input"
        />
        <p className="mt-1 text-xs text-slate-500">
          Använd gärna Markdown för formatering
        </p>
      </div>

      <div>
        <label className="label">Funktioner</label>
        <p className="mb-2 text-xs text-slate-500">
          Lista de viktigaste funktionerna i programvaran
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={featureInput}
            onChange={(e) => setFeatureInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
            placeholder="t.ex. Automatisk ärendetilldelning"
            className="input flex-1"
          />
          <button
            onClick={addFeature}
            type="button"
            className="rounded-lg bg-slate-100 px-4 py-2 font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
          >
            Lägg till
          </button>
        </div>
        {(data.description.sv?.features?.length ?? 0) > 0 && (
          <ul className="mt-3 space-y-2">
            {data.description.sv?.features?.map((feature, index) => (
              <li
                key={index}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-800"
              >
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {feature}
                </span>
                <button
                  onClick={() => removeFeature(index)}
                  className="text-slate-400 hover:text-red-500"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <label className="label">Lokalt namn (valfritt)</label>
        <input
          type="text"
          value={data.description.sv?.localisedName || ''}
          onChange={(e) => updateData('description.sv.localisedName', e.target.value)}
          placeholder="Om projektet har ett svenskt namn som skiljer sig från det officiella"
          className="input"
        />
      </div>
    </div>
  );
}

function Step4({
  data,
  updateData,
  licenseOptions,
}: {
  data: PubliccodeData;
  updateData: (path: string, value: unknown) => void;
  licenseOptions: Array<{ value: string; label: string; description: string }>;
}) {
  const isPriorityCategory = data.categories.some((c) =>
    ['case-management', 'civic-engagement', 'data-analytics', 'document-management', 'identity', 'local-government', 'participation', 'reporting', 'workflow-automation'].includes(c)
  );

  return (
    <div className="relative space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Steg 4 av 6
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Licens och juridik
        </h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Vilken licens används och vem äger koden?
        </p>
      </div>

      <div>
        <label className="label">Licens *</label>
        <div className="mt-2 grid gap-3">
          {licenseOptions.map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                data.legal.license === option.value
                  ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
              }`}
            >
              <input
                type="radio"
                name="license"
                value={option.value}
                checked={data.legal.license === option.value}
                onChange={(e) => updateData('legal.license', e.target.value)}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-slate-900 dark:text-white">
                  {option.label}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {option.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Ägare av kodarkivet</label>
        <input
          type="text"
          value={data.legal.repoOwner || ''}
          onChange={(e) => updateData('legal.repoOwner', e.target.value)}
          placeholder="t.ex. Stockholms stad"
          className="input"
        />
        <p className="mt-1 text-xs text-slate-500">
          Organisationen som äger och ansvarar för kodarkivet
        </p>
      </div>

      {/* DIS Fas 1 toggle */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              Digital Infrastruktur för Samhällsservice - Fas 1
            </h3>
            <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
              Markera om detta projekt är del av DIS Fas 1-initiativet.
              Detta ger extra synlighet i kataloger.
            </p>
            {!isPriorityCategory && (
              <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                Tips: Välj en prioriterad kategori i steg 1 för att kvalificera för DIS Fas 1
              </p>
            )}
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={data.sv?.disFas1 || false}
              onChange={(e) => updateData('sv.disFas1', e.target.checked)}
              className="peer sr-only"
            />
            <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-300 dark:bg-slate-700 dark:peer-focus:ring-blue-800" />
          </label>
        </div>
      </div>
    </div>
  );
}

function Step5({
  data,
  updateData,
  maintenanceTypeOptions,
}: {
  data: PubliccodeData;
  updateData: (path: string, value: unknown) => void;
  maintenanceTypeOptions: Array<{ value: string; label: string; description: string }>;
}) {
  return (
    <div className="relative space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
          Steg 5 av 6
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Underhåll och kontakt
        </h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Vem ansvarar för projektet och hur kan man nå dem?
        </p>
      </div>

      <div>
        <label className="label">Underhållstyp *</label>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {maintenanceTypeOptions.map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
                data.maintenance.type === option.value
                  ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                  : 'border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600'
              }`}
            >
              <input
                type="radio"
                name="maintenanceType"
                value={option.value}
                checked={data.maintenance.type === option.value}
                onChange={(e) => updateData('maintenance.type', e.target.value)}
                className="mt-1"
              />
              <div>
                <div className="font-medium text-slate-900 dark:text-white">
                  {option.label}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {option.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="label">Kontaktperson *</label>
        <div className="space-y-3">
          <input
            type="text"
            value={data.maintenance.contacts[0]?.name || ''}
            onChange={(e) => updateData('maintenance.contacts', [{ ...data.maintenance.contacts[0], name: e.target.value }])}
            placeholder="För- och efternamn"
            className="input"
          />
          <input
            type="email"
            value={data.maintenance.contacts[0]?.email || ''}
            onChange={(e) => updateData('maintenance.contacts', [{ ...data.maintenance.contacts[0], email: e.target.value }])}
            placeholder="E-postadress"
            className="input"
          />
          <input
            type="tel"
            value={data.maintenance.contacts[0]?.phone || ''}
            onChange={(e) => updateData('maintenance.contacts', [{ ...data.maintenance.contacts[0], phone: e.target.value }])}
            placeholder="Telefonnummer (valfritt)"
            className="input"
          />
        </div>
        <p className="mt-1 text-xs text-slate-500">
          Personen som kan svara på frågor om projektet
        </p>
      </div>

      <div>
        <label className="label">Programvaruversion</label>
        <input
          type="text"
          value={data.softwareVersion}
          onChange={(e) => updateData('softwareVersion', e.target.value)}
          placeholder="t.ex. 1.0.0"
          className="input"
        />
      </div>

      <div>
        <label className="label">Senaste releaseatum</label>
        <input
          type="date"
          value={data.releaseDate}
          onChange={(e) => updateData('releaseDate', e.target.value)}
          className="input"
        />
      </div>
    </div>
  );
}

function Step6({
  yaml,
  onDownload,
  onCopy,
}: {
  yaml: string;
  onDownload: () => void;
  onCopy: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">
          Steg 6 av 6
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Redo att exportera!
        </h2>
        <p className="mt-2 text-slate-600 dark:text-slate-400">
          Din projektbeskrivning är klar. Ladda ner filen och lägg den i roten av ditt kodarkiv.
        </p>
      </div>

      {/* Success banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-white shadow-lg shadow-green-500/20">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur">
            <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold">Allt klart!</h3>
            <p className="mt-1 text-green-100">
              Placera filen <code className="rounded bg-white/20 px-2 py-0.5 font-mono text-sm">publiccode.yml</code> i
              roten av ditt kodarkiv. Då blir projektet automatiskt sökbart.
            </p>
          </div>
        </div>
      </div>

      {/* YAML Preview - terminal style */}
      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-700 px-5 py-3">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
            <span className="text-xs font-medium text-slate-400">publiccode.yml</span>
          </div>
          <button
            onClick={handleCopy}
            className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-slate-700 hover:text-white"
          >
            {copied ? 'Kopierat!' : 'Kopiera'}
          </button>
        </div>
        <pre className="max-h-48 overflow-auto p-5 text-xs leading-relaxed text-slate-300">
          {yaml}
        </pre>
      </div>

      {/* Action buttons */}
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          onClick={onDownload}
          className="group flex items-center justify-center gap-3 rounded-2xl bg-blue-500 px-6 py-4 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 hover:shadow-xl hover:shadow-blue-500/30"
        >
          <svg className="h-5 w-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Ladda ner publiccode.yml
        </button>
        <button
          onClick={handleCopy}
          className="group flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-slate-600"
        >
          <svg className="h-5 w-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copied ? 'Kopierat!' : 'Kopiera till urklipp'}
        </button>
      </div>

      {/* Next steps */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-6 dark:border-slate-800 dark:from-slate-800/50 dark:to-slate-900/50">
        <h3 className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
          <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          Nästa steg
        </h3>
        <ol className="mt-4 space-y-3">
          <li className="flex items-start gap-3 text-sm">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">1</span>
            <span className="text-slate-600 dark:text-slate-400">Ladda ner filen och lägg den i roten av ditt kodarkiv</span>
          </li>
          <li className="flex items-start gap-3 text-sm">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">2</span>
            <span className="text-slate-600 dark:text-slate-400">Pusha ändringen till ditt kodarkiv (t.ex. GitHub)</span>
          </li>
          <li className="flex items-start gap-3 text-sm">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600 dark:bg-blue-900/50 dark:text-blue-400">3</span>
            <span className="text-slate-600 dark:text-slate-400">Lägg till automatisk validering med vår GitHub-integration</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
