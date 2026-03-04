'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { stringify } from 'yaml';
// Importera endast CATEGORIES (inte validator som använder fs)
import { CATEGORIES } from '@samhallskodex/core/categories';
// Importera scorer för poängberäkning (samma som används vid registrering)
import { score as coreScore } from '@samhallskodex/core/scorer';

// Score calculation - använder samma logik som core-paketet
interface ScoreBreakdown {
  total: number;
  categories: {
    name: string;
    score: number;
    maxScore: number;
    items: Array<{ label: string; fulfilled: boolean; points: number }>;
  }[];
}

// Kategorinamn på svenska
const CATEGORY_NAMES: Record<string, string> = {
  requiredFields: 'Obligatoriska fält',
  documentation: 'Dokumentation',
  localisation: 'Lokalisering',
  maintenance: 'Underhåll',
  disSpecific: 'DIS-specifikt',
};

// Fältnamn på svenska
const FIELD_NAMES: Record<string, string> = {
  name: 'Projektnamn',
  url: 'Kodarkiv (URL)',
  softwareVersion: 'Programversion',
  releaseDate: 'Releasedatum',
  platforms: 'Plattformar',
  categories: 'Kategorier',
  developmentStatus: 'Utvecklingsstatus',
  softwareType: 'Programtyp',
  description: 'Beskrivning',
  'legal.license': 'Licens',
  'legal.repoOwner': 'Ägare av kodarkiv',
  longDescription: 'Lång beskrivning (>500 tecken)',
  documentation: 'Dokumentations-URL',
  screenshots: 'Skärmdumpar',
  features: 'Funktioner (minst 3)',
  videos: 'Videor',
  'description.sv': 'Svensk beskrivning',
  swedishContact: 'Svensk kontakt (.se eller +46)',
  'localisation.sv': 'Svenska i availableLanguages',
  'maintenance.type': 'Underhållstyp (internal/contract)',
  'maintenance.contacts': 'Kontaktpersoner',
  recentRelease: 'Nyligen uppdaterad (inom 6 mån)',
  disFase1Category: 'DIS Fas 1-kategori',
  multipleCategories: 'Minst 2 kategorier',
  dependencies: 'Beroenden specificerade',
};

function calculateScore(data: PubliccodeData): ScoreBreakdown {
  // Konvertera till PublicCode-format som core-paketet förväntar sig
  const publiccodeData = {
    publiccodeYmlVersion: '0.5.0',
    name: data.name,
    url: data.url,
    softwareVersion: data.softwareVersion || '',
    releaseDate: data.releaseDate || '',
    platforms: data.platforms || [],
    categories: data.categories,
    developmentStatus: data.developmentStatus,
    softwareType: data.softwareType || 'standalone/other',
    description: data.description,
    legal: data.legal,
    maintenance: data.maintenance,
    localisation: data.localisation || { localisationReady: false, availableLanguages: [] },
    dependsOn: data.dependsOn,
    isBasedOn: data.isBasedOn,
  };

  // Använd core-paketets poängberäkning
  const result = coreScore(publiccodeData as never);

  // Konvertera till UI-format
  const categories: ScoreBreakdown['categories'] = [];

  // Mappa breakdown till UI-kategorier
  const breakdownEntries = Object.entries(result.breakdown) as [string, { score: number; maxScore: number; items: Array<{ name: string; score: number; maxScore: number; met: boolean }> }][];

  for (const [key, category] of breakdownEntries) {
    categories.push({
      name: CATEGORY_NAMES[key] || key,
      score: category.score,
      maxScore: category.maxScore,
      items: category.items.map(item => ({
        label: FIELD_NAMES[item.name] || item.name,
        fulfilled: item.met,
        points: item.maxScore,
      })),
    });
  }

  return { total: result.total, categories };
}

// Generate improvement suggestions
interface Suggestion {
  id: string;
  title: string;
  description: string;
  points: number;
  step: number;
  priority: 'high' | 'medium' | 'low';
  action?: string;
}

function generateSuggestions(data: PubliccodeData): Suggestion[] {
  const suggestions: Suggestion[] = [];

  // Step 1: Basic info
  if (!data.name) {
    suggestions.push({
      id: 'name',
      title: 'Lägg till projektnamn',
      description: 'Ett tydligt namn hjälper andra hitta projektet',
      points: 8,
      step: 1,
      priority: 'high',
      action: 'Fyll i Projektnamn',
    });
  }

  if (!data.url) {
    suggestions.push({
      id: 'url',
      title: 'Lägg till kodarkiv-URL',
      description: 'Länk till där källkoden finns',
      points: 8,
      step: 1,
      priority: 'high',
      action: 'Fyll i Kodarkiv URL',
    });
  }

  if (!data.developmentStatus) {
    suggestions.push({
      id: 'status',
      title: 'Välj utvecklingsstatus',
      description: 'Visa om projektet är stabilt eller under utveckling',
      points: 5,
      step: 1,
      priority: 'medium',
      action: 'Välj status',
    });
  }

  // Step 2: Categories
  if (data.categories.length === 0) {
    suggestions.push({
      id: 'categories',
      title: 'Välj minst en kategori',
      description: 'Kategorier gör projektet sökbart',
      points: 4,
      step: 2,
      priority: 'high',
      action: 'Välj kategorier',
    });
  }

  const priorityCategories = CATEGORIES.filter(c => c.disFase1).map(c => c.id);
  const hasPriorityCategory = data.categories.some(c => priorityCategories.includes(c as typeof priorityCategories[number]));

  if (!hasPriorityCategory && data.categories.length > 0) {
    suggestions.push({
      id: 'priority-cat',
      title: 'Överväg en DIS Fas 1-kategori',
      description: 'Projekt inom prioriterade områden får extra synlighet',
      points: 3,
      step: 2,
      priority: 'low',
      action: 'Se prioriterade kategorier',
    });
  }

  // Step 3: Description
  if (!data.description.sv?.shortDescription) {
    suggestions.push({
      id: 'short-desc',
      title: 'Lägg till kort beskrivning',
      description: 'En sammanfattning visas i sökresultat',
      points: 10,
      step: 3,
      priority: 'high',
      action: 'Skriv beskrivning',
    });
  }

  if (!data.description.sv?.longDescription || data.description.sv.longDescription.length < 50) {
    suggestions.push({
      id: 'long-desc',
      title: 'Lägg till längre beskrivning',
      description: 'Förklara vad projektet gör och för vem',
      points: 10,
      step: 3,
      priority: 'medium',
      action: 'Skriv detaljerad beskrivning',
    });
  }

  if (!data.description.sv?.features || data.description.sv.features.length === 0) {
    suggestions.push({
      id: 'features',
      title: 'Lista projektets funktioner',
      description: 'Visa vad användare kan göra med projektet',
      points: 5,
      step: 3,
      priority: 'low',
      action: 'Lägg till funktioner',
    });
  }

  // Step 4: License
  if (!data.legal.license) {
    suggestions.push({
      id: 'license',
      title: 'Välj en licens',
      description: 'Obligatoriskt för öppen källkod',
      points: 15,
      step: 4,
      priority: 'high',
      action: 'Välj licens',
    });
  }

  if (!data.legal.repoOwner) {
    suggestions.push({
      id: 'owner',
      title: 'Ange ägare',
      description: 'Vem ansvarar för kodarkivet?',
      points: 5,
      step: 4,
      priority: 'low',
      action: 'Ange organisation',
    });
  }

  if (!data.sv?.disFas1 && hasPriorityCategory) {
    suggestions.push({
      id: 'dis-fas1',
      title: 'Aktivera DIS Fas 1-markering',
      description: 'Du har valt en prioriterad kategori',
      points: 4,
      step: 4,
      priority: 'medium',
      action: 'Aktivera DIS Fas 1',
    });
  }

  // Step 5: Maintenance
  if (!data.maintenance.type) {
    suggestions.push({
      id: 'maint-type',
      title: 'Välj underhållstyp',
      description: 'Hur underhålls projektet?',
      points: 5,
      step: 5,
      priority: 'medium',
      action: 'Välj underhållstyp',
    });
  }

  if (!data.maintenance.contacts[0]?.name) {
    suggestions.push({
      id: 'contact-name',
      title: 'Lägg till kontaktperson',
      description: 'Vem kan svara på frågor?',
      points: 10,
      step: 5,
      priority: 'high',
      action: 'Ange kontaktperson',
    });
  }

  if (!data.maintenance.contacts[0]?.email && data.maintenance.contacts[0]?.name) {
    suggestions.push({
      id: 'contact-email',
      title: 'Lägg till e-post',
      description: 'Gör det lätt att nå kontaktpersonen',
      points: 5,
      step: 5,
      priority: 'medium',
      action: 'Ange e-post',
    });
  }

  // Sort by priority and points
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return suggestions.sort((a, b) => {
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return b.points - a.points;
  });
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
  dependsOn?: {
    open?: Array<{ name: string; versionMin?: string; versionMax?: string; optional?: boolean }>;
    proprietary?: Array<{ name: string; versionMin?: string; versionMax?: string; optional?: boolean }>;
    hardware?: Array<{ name: string; versionMin?: string; versionMax?: string; optional?: boolean }>;
  };
  isBasedOn?: string | string[];
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
};

const steps = [
  { id: 1, name: 'Grundinfo', description: 'Namn och webbadress' },
  { id: 2, name: 'Kategori', description: 'Välj typ av programvara' },
  { id: 3, name: 'Beskrivning', description: 'Beskriv vad den gör' },
  { id: 4, name: 'Licens', description: 'Juridisk information' },
  { id: 5, name: 'Underhåll', description: 'Kontaktperson' },
  { id: 6, name: 'Exportera', description: 'Ladda ner filen' },
];

// Category aliases - map common invalid categories to valid ones
const CATEGORY_ALIASES: Record<string, string> = {
  'software-development': 'application-development',
  'software': 'application-development',
  'development': 'application-development',
  'coding': 'application-development',
  'programming': 'application-development',
  'web-development': 'application-development',
  'app-development': 'application-development',
  'customer-support': 'customer-service-and-support',
  'support': 'customer-service-and-support',
  'helpdesk': 'help-desk',
  'devops': 'it-development',
  'ci-cd': 'it-development',
  'automation': 'workflow-management',
  'process-automation': 'workflow-management',
  'government': 'local-government',
  'public-sector': 'local-government',
  'municipality': 'local-government',
  'kommun': 'local-government',
  'security': 'it-security',
  'cybersecurity': 'it-security',
  'authentication': 'identity-management',
  'auth': 'identity-management',
  'login': 'identity-management',
  'sso': 'identity-management',
  'analytics': 'data-analytics',
  'reporting': 'data-analytics',
  'dashboard': 'data-visualization',
  'charts': 'data-visualization',
  'documents': 'document-management',
  'files': 'document-management',
  'file-management': 'document-management',
  'tasks': 'task-management',
  'todo': 'task-management',
  'projects': 'project-management',
};

// Generera categoryOptions från CATEGORIES (alla 117 kategorier enligt standarden)
// DIS Fas 1-kategorier visas först, sedan övriga i alfabetisk ordning
const categoryOptions = CATEGORIES
  .map((cat) => ({
    value: cat.id,
    label: cat.sv.name,
    description: cat.sv.description,
    priority: cat.disFase1,
  }))
  .sort((a, b) => {
    // Prioriterade först, sedan alfabetiskt
    if (a.priority && !b.priority) return -1;
    if (!a.priority && b.priority) return 1;
    return a.label.localeCompare(b.label, 'sv');
  });

// Valid category IDs for filtering and validation
const validCategoryIds = new Set<string>(categoryOptions.map(c => c.value));

// Helper function to validate and map categories
function validateAndMapCategories(categories: string[]): string[] {
  const result: string[] = [];
  for (const cat of categories) {
    // First check if it's already valid
    if (validCategoryIds.has(cat)) {
      result.push(cat);
    } else {
      // Try to map it using aliases
      const mapped = CATEGORY_ALIASES[cat.toLowerCase()];
      if (mapped && validCategoryIds.has(mapped)) {
        result.push(mapped);
      }
      // Otherwise skip the invalid category
    }
  }
  // Remove duplicates
  return [...new Set(result)];
}

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

// Wrapper component to handle Suspense for useSearchParams
export default function EditorPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Laddar editor...</div>
      </div>
    }>
      <EditorPage />
    </Suspense>
  );
}

function EditorPage() {
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<PubliccodeData>(initialData);
  const [showYaml, setShowYaml] = useState(false);
  const [showScore, setShowScore] = useState(true);
  const [aiLoadedMessage, setAiLoadedMessage] = useState<string | null>(null);
  const [repoUrl, setRepoUrl] = useState<string | null>(null);
  const [isPushing, setIsPushing] = useState(false);
  const [pushResult, setPushResult] = useState<{ success: boolean; message: string; fileUrl?: string } | null>(null);

  // Load AI-generated data from sessionStorage if coming from /add-repo with ai=true
  useEffect(() => {
    if (searchParams.get('ai') === 'true') {
      const aiDataStr = sessionStorage.getItem('ai-publiccode-data');
      const aiRepoUrl = sessionStorage.getItem('ai-repo-url');

      if (aiDataStr) {
        try {
          const aiData = JSON.parse(aiDataStr);

          // Map AI suggestion to our PubliccodeData format
          const newData: PubliccodeData = {
            ...initialData,
            name: aiData.name || '',
            url: aiData.url || aiRepoUrl || '',
            softwareVersion: aiData.softwareVersion || '',
            releaseDate: aiData.releaseDate || '',
            platforms: aiData.platforms || [],
            categories: aiData.categories || [],
            developmentStatus: aiData.developmentStatus || 'development',
            softwareType: aiData.softwareType || 'standalone/other',
            description: aiData.description || { sv: { shortDescription: '', longDescription: '' } },
            legal: aiData.legal || { license: '', repoOwner: '' },
            maintenance: aiData.maintenance || { type: 'internal', contacts: [] },
            localisation: aiData.localisation || { localisationReady: false, availableLanguages: [] },
            dependsOn: aiData.dependsOn || {},
            isBasedOn: aiData.isBasedOn || [],
          };

          setData(newData);

          // Store repo URL for push functionality
          if (aiRepoUrl) {
            setRepoUrl(aiRepoUrl);
          }

          setAiLoadedMessage('AI har analyserat repot och fyllt i förslag. Granska och justera sedan exportera.');

          // Clear sessionStorage
          sessionStorage.removeItem('ai-publiccode-data');
          sessionStorage.removeItem('ai-repo-url');

          // Auto-hide message after 5 seconds
          setTimeout(() => setAiLoadedMessage(null), 5000);
        } catch {
          console.error('Failed to parse AI data from sessionStorage');
        }
      }
    }
  }, [searchParams]);

  const scoreBreakdown = useMemo(() => calculateScore(data), [data]);
  const suggestions = useMemo(() => generateSuggestions(data), [data]);

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

  // Validate if user can proceed to next step
  const canProceedToNextStep = (): { canProceed: boolean; missingFields: string[] } => {
    const missingFields: string[] = [];

    switch (currentStep) {
      case 1: // Grundinfo - name and url required
        if (!data.name?.trim()) missingFields.push('Namn');
        if (!data.url?.trim()) missingFields.push('URL');
        break;
      case 2: // Kategori - at least one category required
        if (!data.categories || data.categories.length === 0) missingFields.push('Minst en kategori');
        if (!data.developmentStatus?.trim()) missingFields.push('Utvecklingsstatus');
        break;
      case 3: // Beskrivning - shortDescription required
        if (!data.description?.sv?.shortDescription?.trim()) missingFields.push('Kort beskrivning (svenska)');
        break;
      case 4: // Licens - license required
        if (!data.legal?.license?.trim()) missingFields.push('Licens');
        break;
      case 5: // Underhåll - contact name and email required
        const contacts = data.maintenance?.contacts || [];
        const hasValidContact = contacts.some(c =>
          c.name?.trim() && c.email?.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email.trim())
        );
        if (!hasValidContact) {
          if (!contacts[0]?.name?.trim()) missingFields.push('Kontaktpersonens namn');
          if (!contacts[0]?.email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contacts[0]?.email?.trim() || '')) {
            missingFields.push('Giltig e-postadress');
          }
        }
        break;
    }

    return { canProceed: missingFields.length === 0, missingFields };
  };

  const validation = canProceedToNextStep();

  const nextStep = () => {
    if (currentStep < steps.length && validation.canProceed) {
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
    return stringify(cleaned, { lineWidth: 0 });
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

  const pushToGitHub = async () => {
    if (!repoUrl) return;

    setIsPushing(true);
    setPushResult(null);

    try {
      const yaml = generateYaml();
      const response = await fetch('/api/github/push-file', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repoUrl,
          content: yaml,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setPushResult({
          success: true,
          message: data.message,
          fileUrl: data.fileUrl,
        });
      } else {
        setPushResult({
          success: false,
          message: data.error || 'Kunde inte pusha till GitHub',
        });
      }
    } catch {
      setPushResult({
        success: false,
        message: 'Kunde inte ansluta till servern',
      });
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
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
        {/* AI loaded message banner */}
        {aiLoadedMessage && (
          <div className="mb-6 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 p-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-500/30">
                <svg className="h-5 w-5 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <p className="flex-1 text-purple-200">{aiLoadedMessage}</p>
              <button
                onClick={() => setAiLoadedMessage(null)}
                className="rounded-full p-1 text-purple-300 hover:bg-purple-500/20 transition"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Form - takes 3 of 5 columns */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-800/50 p-8 shadow-xl backdrop-blur lg:col-span-3">
            {/* Decorative gradient */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-3xl" />
            {currentStep === 1 && (
              <Step1
                data={data}
                updateData={updateData}
                developmentStatusOptions={developmentStatusOptions}
                onSetRepoUrl={setRepoUrl}
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
                repoUrl={repoUrl}
                onPushToGitHub={pushToGitHub}
                isPushing={isPushing}
                pushResult={pushResult}
              />
            )}

            {/* Navigation */}
            <div className="relative mt-10 flex items-center justify-between border-t border-slate-700 pt-8">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="group inline-flex items-center gap-2 rounded-full border border-slate-600 px-6 py-3 text-sm font-semibold text-slate-300 transition-all hover:border-slate-500 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <svg className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Föregående
              </button>

              {/* Step indicator for mobile */}
              <span className="text-sm font-medium text-slate-400 sm:hidden">
                {currentStep} / {steps.length}
              </span>

              {currentStep < steps.length ? (
                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={nextStep}
                    disabled={!validation.canProceed}
                    className={`group inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-lg transition-all ${
                      validation.canProceed
                        ? 'bg-blue-500 text-white shadow-blue-500/25 hover:bg-blue-400 hover:shadow-xl hover:shadow-blue-500/30'
                        : 'bg-slate-600 text-slate-400 cursor-not-allowed shadow-none'
                    }`}
                  >
                    Nästa steg
                    <svg className={`h-4 w-4 transition-transform ${validation.canProceed ? 'group-hover:translate-x-1' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                  {!validation.canProceed && validation.missingFields.length > 0 && (
                    <p className="text-xs text-red-400">
                      Saknas: {validation.missingFields.join(', ')}
                    </p>
                  )}
                </div>
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
              <div className="relative overflow-hidden rounded-3xl border border-slate-700 bg-slate-800/50 p-6 shadow-xl backdrop-blur">
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br from-green-500/10 to-emerald-500/10 blur-2xl" />

                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    Kvalitetspoäng
                  </h3>
                  <button
                    onClick={() => setShowScore(false)}
                    className="rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-700 hover:text-slate-300"
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
                        className="text-slate-700"
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
                        scoreBreakdown.total >= 80 ? 'text-green-400' :
                        scoreBreakdown.total >= 50 ? 'text-amber-400' :
                        'text-red-400'
                      }`}>
                        {scoreBreakdown.total}
                      </span>
                      <span className="text-xs font-medium text-slate-500">av 100</span>
                    </div>
                  </div>
                  <p className={`mt-3 text-sm font-semibold ${
                    scoreBreakdown.total >= 80 ? 'text-green-400' :
                    scoreBreakdown.total >= 50 ? 'text-amber-400' :
                    'text-slate-400'
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
                        <span className="font-medium text-slate-300">{cat.name}</span>
                        <span className={`font-bold ${
                          cat.score === cat.maxScore ? 'text-green-400' :
                          cat.score > 0 ? 'text-blue-400' :
                          'text-slate-400'
                        }`}>
                          {cat.score}/{cat.maxScore}
                        </span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-700">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            cat.score === cat.maxScore
                              ? 'bg-green-500'
                              : cat.score > 0
                              ? 'bg-blue-500'
                              : 'bg-slate-600'
                          }`}
                          style={{ width: `${(cat.score / cat.maxScore) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Improvement suggestions - clickable with step navigation */}
                {suggestions.length > 0 && (
                  <div className="mt-6 rounded-2xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-4">
                    <p className="flex items-center gap-2 text-xs font-bold text-slate-300">
                      <svg className="h-4 w-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Förbättringsförslag
                    </p>
                    <ul className="mt-3 space-y-2">
                      {suggestions.slice(0, 4).map((suggestion) => (
                        <li key={suggestion.id}>
                          <button
                            onClick={() => setCurrentStep(suggestion.step)}
                            className="group flex w-full items-start gap-2 rounded-lg p-1.5 text-left transition-colors hover:bg-slate-700/50"
                          >
                            <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
                              suggestion.priority === 'high'
                                ? 'bg-red-900/50 text-red-400'
                                : suggestion.priority === 'medium'
                                ? 'bg-amber-900/50 text-amber-400'
                                : 'bg-slate-700 text-slate-400'
                            }`}>
                              +{suggestion.points}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-medium text-slate-300 group-hover:text-white">
                                {suggestion.title}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {suggestion.description}
                              </p>
                            </div>
                            <svg className="h-4 w-4 shrink-0 text-slate-400 opacity-0 transition-opacity group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                    {suggestions.length > 4 && (
                      <p className="mt-2 text-center text-[10px] text-slate-500">
                        +{suggestions.length - 4} till
                      </p>
                    )}
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
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-700 bg-slate-800/50 px-4 py-4 text-sm font-semibold text-slate-300 shadow-sm backdrop-blur transition-all hover:border-slate-600 hover:shadow-md"
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
  onImport,
  onSetRepoUrl,
}: {
  data: PubliccodeData;
  updateData: (path: string, value: unknown) => void;
  developmentStatusOptions: Array<{ value: string; label: string; description: string }>;
  onImport?: (importData: { name: string; url: string; description: string; license: string; repoOwner: string; releaseDate: string }) => void;
  onSetRepoUrl?: (url: string | null) => void;
}) {
  const [githubUrl, setGithubUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const [foundPubliccodeYml, setFoundPubliccodeYml] = useState(false);
  const [aiAnalyzed, setAiAnalyzed] = useState(false);

  // AI-analys - fyller i ALLA falt automatiskt
  const handleAiAnalysis = async () => {
    if (!githubUrl.trim()) return;

    setIsAnalyzing(true);
    setImportError(null);
    setImportSuccess(false);
    setAiAnalyzed(false);

    try {
      const response = await fetch('/api/ai/analyze-repo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: githubUrl }),
      });

      const result = await response.json();

      if (!response.ok) {
        setImportError(result.error || 'Ett fel uppstod vid AI-analys');
        return;
      }

      if (result.success && result.suggestion) {
        const s = result.suggestion;

        // Basic info
        if (s.name) updateData('name', s.name);
        if (s.url) updateData('url', s.url);
        if (s.landingURL) updateData('landingURL', s.landingURL);
        if (s.softwareVersion) updateData('softwareVersion', s.softwareVersion);
        if (s.releaseDate) updateData('releaseDate', s.releaseDate);
        if (s.platforms?.length) updateData('platforms', s.platforms);
        if (s.categories?.length) {
          const validatedCategories = validateAndMapCategories(s.categories);
          updateData('categories', validatedCategories);
        }
        if (s.developmentStatus) updateData('developmentStatus', s.developmentStatus);
        if (s.softwareType) updateData('softwareType', s.softwareType);

        // Description - Swedish
        if (s.description?.sv) {
          if (s.description.sv.shortDescription) {
            updateData('description.sv.shortDescription', s.description.sv.shortDescription);
          }
          if (s.description.sv.longDescription) {
            updateData('description.sv.longDescription', s.description.sv.longDescription);
          }
          if (s.description.sv.features?.length) {
            updateData('description.sv.features', s.description.sv.features);
          }
          if (s.description.sv.documentation) {
            updateData('description.sv.documentation', s.description.sv.documentation);
          }
        }

        // Description - English (store as backup)
        if (s.description?.en && !s.description?.sv) {
          if (s.description.en.shortDescription) {
            updateData('description.sv.shortDescription', s.description.en.shortDescription);
          }
          if (s.description.en.longDescription) {
            updateData('description.sv.longDescription', s.description.en.longDescription);
          }
          if (s.description.en.features?.length) {
            updateData('description.sv.features', s.description.en.features);
          }
        }

        // Legal
        if (s.legal) {
          if (s.legal.license) updateData('legal.license', s.legal.license);
          if (s.legal.repoOwner) updateData('legal.repoOwner', s.legal.repoOwner);
          if (s.legal.mainCopyrightOwner) updateData('legal.mainCopyrightOwner', s.legal.mainCopyrightOwner);
        }

        // Maintenance
        if (s.maintenance) {
          if (s.maintenance.type) updateData('maintenance.type', s.maintenance.type);
          if (s.maintenance.contacts?.length) {
            updateData('maintenance.contacts', s.maintenance.contacts);
          }
        }

        // Localisation
        if (s.localisation) {
          if (typeof s.localisation.localisationReady === 'boolean') {
            updateData('localisation.localisationReady', s.localisation.localisationReady);
          }
          if (s.localisation.availableLanguages?.length) {
            updateData('localisation.availableLanguages', s.localisation.availableLanguages);
          }
        }

        setAiAnalyzed(true);
        setImportSuccess(true);

        // Store repo URL for push functionality
        if (onSetRepoUrl && githubUrl) {
          onSetRepoUrl(githubUrl.trim());
        }
      }
    } catch {
      setImportError('Kunde inte ansluta till AI-tjansten');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImport = async () => {
    if (!githubUrl.trim()) return;

    setIsImporting(true);
    setImportError(null);
    setImportSuccess(false);
    setFoundPubliccodeYml(false);

    try {
      const response = await fetch('/api/github/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: githubUrl }),
      });

      const result = await response.json();

      if (!response.ok) {
        setImportError(result.error || 'Ett fel uppstod');
        return;
      }

      // If we found an existing publiccode.yml, use it to populate all fields
      if (result.hasPubliccodeYml && result.publiccodeYml) {
        const yml = result.publiccodeYml;

        // Basic info
        if (yml.name) updateData('name', yml.name);
        if (yml.url) updateData('url', yml.url);
        if (yml.softwareVersion) updateData('softwareVersion', yml.softwareVersion);
        if (yml.releaseDate) updateData('releaseDate', yml.releaseDate);
        if (yml.platforms && Array.isArray(yml.platforms)) updateData('platforms', yml.platforms);
        if (yml.categories && Array.isArray(yml.categories)) {
          // Validate and map categories to ensure only valid ones are used
          const validatedCategories = validateAndMapCategories(yml.categories as string[]);
          updateData('categories', validatedCategories);
        }
        if (yml.developmentStatus) updateData('developmentStatus', yml.developmentStatus);
        if (yml.softwareType) updateData('softwareType', yml.softwareType);

        // Legal
        if (yml.legal) {
          const legal = yml.legal as Record<string, unknown>;
          if (legal.license) updateData('legal.license', legal.license);
          if (legal.repoOwner) updateData('legal.repoOwner', legal.repoOwner);
        }

        // Description (handle both sv and en)
        if (yml.description) {
          const desc = yml.description as Record<string, Record<string, unknown>>;
          // Try Swedish first, then English
          const langDesc = desc.sv || desc.en || Object.values(desc)[0];
          if (langDesc) {
            if (langDesc.shortDescription) updateData('description.sv.shortDescription', langDesc.shortDescription);
            if (langDesc.longDescription) updateData('description.sv.longDescription', langDesc.longDescription);
            if (langDesc.features && Array.isArray(langDesc.features)) {
              updateData('description.sv.features', langDesc.features);
            }
            if (langDesc.screenshots && Array.isArray(langDesc.screenshots)) {
              updateData('description.sv.screenshots', langDesc.screenshots);
            }
            if (langDesc.videos && Array.isArray(langDesc.videos)) {
              updateData('description.sv.videos', langDesc.videos);
            }
            if (langDesc.documentation) updateData('description.sv.documentation', langDesc.documentation);
          }
        }

        // Maintenance
        if (yml.maintenance) {
          const maint = yml.maintenance as Record<string, unknown>;
          if (maint.type) updateData('maintenance.type', maint.type);
          if (maint.contacts && Array.isArray(maint.contacts)) {
            updateData('maintenance.contacts', maint.contacts);
          }
        }

        // Localisation
        if (yml.localisation) {
          const loc = yml.localisation as Record<string, unknown>;
          if (typeof loc.localisationReady === 'boolean') {
            updateData('localisation.localisationReady', loc.localisationReady);
          }
          if (loc.availableLanguages && Array.isArray(loc.availableLanguages)) {
            updateData('localisation.availableLanguages', loc.availableLanguages);
          }
        }

        // Dependencies
        if (yml.dependsOn) {
          updateData('dependsOn', yml.dependsOn);
        }
        if (yml.isBasedOn) {
          updateData('isBasedOn', yml.isBasedOn);
        }

        setImportSuccess(true);
        setImportError(null);
        setFoundPubliccodeYml(true);
      } else {
        // No publiccode.yml found - use GitHub repo data
        if (result.name) updateData('name', result.name);
        if (result.url) updateData('url', result.url);
        if (result.description) updateData('description.sv.shortDescription', result.description.slice(0, 150));
        if (result.license) updateData('legal.license', result.license);
        if (result.repoOwner) updateData('legal.repoOwner', result.repoOwner);
        if (result.releaseDate) updateData('releaseDate', result.releaseDate);

        setImportSuccess(true);
      }

      if (onImport) {
        onImport(result);
      }

      setTimeout(() => setImportSuccess(false), 3000);
    } catch {
      setImportError('Kunde inte ansluta till servern');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="relative space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
          Steg 1 av 6
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
          Grundläggande information
        </h2>
        <p className="mt-2 text-slate-400">
          Berätta vad projektet heter och var det finns
        </p>
      </div>

      {/* GitHub Import */}
      <div className="rounded-xl border border-slate-700 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          Importera från GitHub
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Fyll i formuläret automatiskt från ett GitHub-arkiv
        </p>
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleImport())}
            placeholder="https://github.com/owner/repo eller owner/repo"
            className="input flex-1"
            disabled={isImporting || isAnalyzing}
          />
          <button
            onClick={handleImport}
            disabled={isImporting || isAnalyzing || !githubUrl.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-700 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isImporting ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Hamtar...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Importera
              </>
            )}
          </button>
          <button
            onClick={handleAiAnalysis}
            disabled={isImporting || isAnalyzing || !githubUrl.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-3 text-sm font-semibold text-white transition-all hover:from-purple-500 hover:to-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            title="Kräver GitHub-inloggning och ägarskap av repot"
          >
            {isAnalyzing ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Analyserar...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 110 2h-1.07a7 7 0 01-5.22 5.73 2 2 0 11-3.42 0A7 7 0 016.07 16H5a1 1 0 110-2h1a7 7 0 017-7h1V5.73A2 2 0 0112 2z" />
                </svg>
                AI-analys
              </>
            )}
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          <strong>Importera:</strong> Hamtar grunddata fran GitHub. <strong>AI-analys:</strong> Fyller i ALLA falt automatiskt med AI (kraver inloggning och agarskap).
        </p>
        {importError && (
          <p className="mt-2 flex items-center gap-1 text-xs text-red-400">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {importError}
          </p>
        )}
        {importSuccess && (
          <p className={`mt-2 flex items-center gap-1 text-xs ${aiAnalyzed ? 'text-purple-400' : foundPubliccodeYml ? 'text-emerald-400' : 'text-green-400'}`}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {aiAnalyzed
              ? 'AI har fyllt i alla falt! Granska och justera vid behov.'
              : foundPubliccodeYml
              ? 'Hittade publiccode.yml! Alla falt har fyllts i fran befintlig fil.'
              : 'Data importerad fran GitHub! Kontrollera och fyll i resten.'}
          </p>
        )}
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
                  ? 'border-blue-400 bg-blue-900/20'
                  : 'border-slate-700 hover:border-slate-600'
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
                <div className="font-medium text-white">
                  {option.label}
                </div>
                <div className="text-xs text-slate-400">
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categoryOptions;
    const query = searchQuery.toLowerCase();
    return categoryOptions.filter(
      (c) =>
        c.label.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query) ||
        c.value.toLowerCase().includes(query)
    );
  }, [categoryOptions, searchQuery]);

  const priorityCategories = filteredCategories.filter((c) => c.priority);
  const otherCategories = filteredCategories.filter((c) => !c.priority);

  // Get selected categories info
  const selectedCategories = categoryOptions.filter((c) => data.categories.includes(c.value));

  const suggestCategories = async () => {
    if (!data.url) {
      setAiError('Ange GitHub-URL först i steg 1');
      return;
    }

    setIsLoadingAI(true);
    setAiError(null);
    setAiSuggestions([]);

    try {
      const response = await fetch('/api/ai/suggest-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: data.url,
          name: data.name,
          description: data.description?.sv?.shortDescription || '',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setAiError(result.error || 'Kunde inte hämta förslag');
        return;
      }

      // Filter to only include valid categories from our list
      const validCategoryIds = categoryOptions.map(c => c.value);
      const validSuggestions = result.categories.filter((cat: string) => validCategoryIds.includes(cat));

      setAiSuggestions(validSuggestions);

      // Add suggested categories that aren't already selected
      const newCategories = [...data.categories];
      for (const cat of validSuggestions) {
        if (!newCategories.includes(cat)) {
          newCategories.push(cat);
        }
      }
      updateData('categories', newCategories);
    } catch {
      setAiError('Ett fel uppstod vid AI-analys');
    } finally {
      setIsLoadingAI(false);
    }
  };

  const toggleCategory = (value: string, checked: boolean) => {
    if (checked) {
      updateData('categories', [...data.categories, value]);
    } else {
      updateData('categories', data.categories.filter((c) => c !== value));
    }
  };

  const CategoryCheckbox = ({ category, suggested }: { category: typeof categoryOptions[0]; suggested?: boolean }) => (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
        data.categories.includes(category.value)
          ? suggested
            ? 'border-green-400 bg-green-900/20'
            : 'border-blue-400 bg-blue-900/20'
          : 'border-slate-700 hover:border-slate-600'
      }`}
    >
      <input
        type="checkbox"
        checked={data.categories.includes(category.value)}
        onChange={(e) => toggleCategory(category.value, e.target.checked)}
        className="mt-0.5"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">{category.label}</span>
          {suggested && (
            <span className="rounded bg-green-600/30 px-1.5 py-0.5 text-[10px] font-medium text-green-300">
              AI
            </span>
          )}
          {category.priority && (
            <span className="rounded bg-blue-600/30 px-1.5 py-0.5 text-[10px] font-medium text-blue-300">
              DIS
            </span>
          )}
        </div>
        <div className="text-xs text-slate-500">{category.description}</div>
      </div>
    </label>
  );

  return (
    <div className="relative space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
          Steg 2 av 6
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
          Kategorier
        </h2>
        <p className="mt-2 text-slate-400">
          Välj en eller flera kategorier som beskriver vad programvaran gör
        </p>
      </div>

      {/* AI Suggestion Button */}
      <div className="rounded-lg border border-slate-700 bg-slate-800/50 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-white">AI-förslag</p>
            <p className="text-sm text-slate-400">
              Låt AI analysera README och föreslå kategorier
            </p>
          </div>
          <button
            onClick={suggestCategories}
            disabled={isLoadingAI || !data.url}
            className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoadingAI ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyserar...
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Föreslå kategorier
              </>
            )}
          </button>
        </div>
        {aiError && (
          <p className="mt-2 text-sm text-red-400">{aiError}</p>
        )}
        {aiSuggestions.length > 0 && (
          <p className="mt-2 text-sm text-green-400">
            AI föreslog {aiSuggestions.length} kategorier som har lagts till
          </p>
        )}
      </div>

      {/* Selected Categories */}
      {selectedCategories.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-green-400">
            Valda kategorier ({selectedCategories.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedCategories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => toggleCategory(cat.value, false)}
                className="group flex items-center gap-1 rounded-full border border-blue-400 bg-blue-900/30 px-3 py-1 text-sm text-blue-300 transition-colors hover:border-red-400 hover:bg-red-900/30 hover:text-red-300"
              >
                {cat.label}
                <svg className="h-3 w-3 opacity-50 group-hover:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Sök kategorier..."
          className="input w-full pl-10"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Priority Categories */}
      {priorityCategories.length > 0 && (
        <div className="space-y-3">
          <div>
            <p className="text-sm font-semibold text-blue-400">
              Prioriterade områden (DIS Fas 1)
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Projekt inom dessa områden får extra synlighet
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {priorityCategories.map((category) => (
              <CategoryCheckbox
                key={category.value}
                category={category}
                suggested={aiSuggestions.includes(category.value)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Categories (Collapsible) */}
      {otherCategories.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => setShowAllCategories(!showAllCategories)}
            className="flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-800/50 px-4 py-3 text-left transition-colors hover:border-slate-600"
          >
            <div>
              <p className="text-sm font-semibold text-slate-300">
                Övriga kategorier ({otherCategories.length})
              </p>
              <p className="text-xs text-slate-500">
                Klicka för att {showAllCategories ? 'dölja' : 'visa'} alla kategorier
              </p>
            </div>
            <svg
              className={`h-5 w-5 text-slate-400 transition-transform ${showAllCategories ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAllCategories && (
            <div className="grid gap-2 sm:grid-cols-2">
              {otherCategories.map((category) => (
                <CategoryCheckbox
                  key={category.value}
                  category={category}
                  suggested={aiSuggestions.includes(category.value)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* No results */}
      {searchQuery && filteredCategories.length === 0 && (
        <p className="text-center text-slate-500">
          Inga kategorier matchar &ldquo;{searchQuery}&rdquo;
        </p>
      )}
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
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
          Steg 3 av 6
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
          Beskrivning
        </h2>
        <p className="mt-2 text-slate-400">
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
        <div className="mt-1 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Använd gärna Markdown för formatering
          </p>
          <span
            className={`text-xs font-medium ${
              (data.description.sv?.longDescription?.length || 0) >= 500
                ? 'text-green-400'
                : (data.description.sv?.longDescription?.length || 0) >= 150
                  ? 'text-yellow-400'
                  : 'text-red-400'
            }`}
          >
            {data.description.sv?.longDescription?.length || 0} tecken
            {(data.description.sv?.longDescription?.length || 0) < 500 && (
              <span className="text-slate-500"> (minst 500 för full poäng)</span>
            )}
          </span>
        </div>
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
            className="rounded-lg bg-slate-700 px-4 py-2 font-medium text-slate-300 hover:bg-slate-600"
          >
            Lägg till
          </button>
        </div>
        {(data.description.sv?.features?.length ?? 0) > 0 && (
          <ul className="mt-3 space-y-2">
            {data.description.sv?.features?.map((feature, index) => (
              <li
                key={index}
                className="flex items-center justify-between rounded-lg bg-slate-700 px-3 py-2"
              >
                <span className="text-sm text-slate-300">
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
    ['case-management', 'civic-engagement', 'data-analytics', 'document-management', 'identity-management', 'local-government', 'public-participation', 'reporting-issues', 'workflow-management'].includes(c)
  );

  return (
    <div className="relative space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
          Steg 4 av 6
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
          Licens och juridik
        </h2>
        <p className="mt-2 text-slate-400">
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
                  ? 'border-blue-400 bg-blue-900/20'
                  : 'border-slate-700 hover:border-slate-600'
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
                <div className="font-medium text-white">
                  {option.label}
                </div>
                <div className="text-xs text-slate-400">
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
      <div className="rounded-xl border border-blue-800 bg-blue-900/20 p-4">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-blue-100">
              Prioriterat samhällsområde
            </h3>
            <p className="mt-1 text-sm text-blue-300">
              Markera om detta projekt tillhör ett prioriterat samhällsområde.
              Detta ger extra synlighet i katalogen.
            </p>
            {!isPriorityCategory && (
              <p className="mt-2 text-xs text-amber-400">
                Tips: Välj en prioriterad kategori i steg 1 för att kvalificera
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
            <div className="peer h-6 w-11 rounded-full bg-slate-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-500 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:ring-4 peer-focus:ring-blue-800" />
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
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-400">
          Steg 5 av 6
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
          Underhåll och kontakt
        </h2>
        <p className="mt-2 text-slate-400">
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
                  ? 'border-blue-400 bg-blue-900/20'
                  : 'border-slate-700 hover:border-slate-600'
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
                <div className="font-medium text-white">
                  {option.label}
                </div>
                <div className="text-xs text-slate-400">
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
  repoUrl,
  onPushToGitHub,
  isPushing,
  pushResult,
}: {
  yaml: string;
  onDownload: () => void;
  onCopy: () => void;
  repoUrl: string | null;
  onPushToGitHub: () => void;
  isPushing: boolean;
  pushResult: { success: boolean; message: string; fileUrl?: string } | null;
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
        <p className="text-sm font-semibold uppercase tracking-wider text-green-400">
          Steg 6 av 6
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
          Redo att exportera!
        </h2>
        <p className="mt-2 text-slate-400">
          {repoUrl
            ? 'Din projektbeskrivning är klar. Pusha direkt till GitHub eller ladda ner filen.'
            : 'Din projektbeskrivning är klar. Ladda ner filen och lägg den i roten av ditt kodarkiv.'}
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

      {/* Push result message */}
      {pushResult && (
        <div className={`rounded-xl p-4 ${
          pushResult.success
            ? 'bg-green-500/20 border border-green-500/30'
            : 'bg-red-500/20 border border-red-500/30'
        }`}>
          <div className="flex items-center gap-3">
            {pushResult.success ? (
              <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span className={pushResult.success ? 'text-green-200' : 'text-red-200'}>
              {pushResult.message}
            </span>
            {pushResult.fileUrl && (
              <a
                href={pushResult.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto text-sm text-green-400 hover:text-green-300 underline"
              >
                Visa på GitHub
              </a>
            )}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className={`grid gap-4 ${repoUrl ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {/* Push to GitHub button - only show if we have a repo URL */}
        {repoUrl && (
          <button
            onClick={onPushToGitHub}
            disabled={isPushing}
            className="group flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 px-6 py-4 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:from-purple-400 hover:to-blue-400 hover:shadow-xl hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPushing ? (
              <>
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Pushar...
              </>
            ) : (
              <>
                <svg className="h-5 w-5 transition-transform group-hover:scale-110" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                Pusha till GitHub
              </>
            )}
          </button>
        )}
        <button
          onClick={onDownload}
          className="group flex items-center justify-center gap-3 rounded-2xl bg-blue-500 px-6 py-4 font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-400 hover:shadow-xl hover:shadow-blue-500/30"
        >
          <svg className="h-5 w-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Ladda ner
        </button>
        <button
          onClick={handleCopy}
          className="group flex items-center justify-center gap-3 rounded-2xl border border-slate-700 bg-slate-800 px-6 py-4 font-semibold text-slate-300 shadow-sm transition-all hover:border-slate-600 hover:shadow-md"
        >
          <svg className="h-5 w-5 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {copied ? 'Kopierat!' : 'Kopiera'}
        </button>
      </div>

      {/* Next steps */}
      <div className="rounded-2xl border border-slate-700 bg-gradient-to-br from-slate-800/50 to-slate-900/50 p-6">
        <h3 className="flex items-center gap-2 font-bold text-white">
          <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          Nästa steg
        </h3>
        <ol className="mt-4 space-y-3">
          <li className="flex items-start gap-3 text-sm">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-900/50 text-xs font-bold text-blue-400">1</span>
            <span className="text-slate-400">Ladda ner filen och lägg den i roten av ditt kodarkiv</span>
          </li>
          <li className="flex items-start gap-3 text-sm">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-900/50 text-xs font-bold text-blue-400">2</span>
            <span className="text-slate-400">Pusha ändringen till ditt kodarkiv (t.ex. GitHub)</span>
          </li>
          <li className="flex items-start gap-3 text-sm">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-900/50 text-xs font-bold text-blue-400">3</span>
            <span className="text-slate-400">Lägg till automatisk validering med vår GitHub-integration</span>
          </li>
        </ol>
      </div>
    </div>
  );
}
