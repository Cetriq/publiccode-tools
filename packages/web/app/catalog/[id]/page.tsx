import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDb, COLLECTIONS } from '@/lib/firebase';
import { ProjectClient } from './ProjectClient';

interface Contact {
  name: string;
  email?: string;
  phone?: string;
  affiliation?: string;
}

interface Contractor {
  name: string;
  email?: string;
  website?: string;
  until?: string;
}

interface Dependency {
  name: string;
  versionMin?: string;
  versionMax?: string;
  optional?: boolean;
}

interface ProjectDetail {
  id: string;
  url: string;
  name: string;
  localisedName?: string;
  shortDescription: string;
  longDescription: string;
  description: string; // For backward compat
  score: number;
  categories: string[];
  disFase1: boolean;
  owner: string;

  // Software info
  softwareVersion?: string;
  releaseDate?: string;
  softwareType?: string;
  platforms?: string[];

  // Legal
  license: string;
  mainCopyrightOwner?: string;
  repoOwner?: string;

  // Status
  developmentStatus: string;
  maintenanceType: string;
  contacts?: Contact[];
  contractors?: Contractor[];

  // Localisation
  localisationReady?: boolean;
  availableLanguages?: string[];

  // Rich content
  features?: string[];
  documentation?: string;
  apiDocumentation?: string;
  screenshots?: string[];
  videos?: string[];
  landingURL?: string;
  logo?: string;

  // Dependencies
  dependsOn?: {
    open?: Dependency[];
    proprietary?: Dependency[];
    hardware?: Dependency[];
  };

  // Timestamps
  lastUpdated: string;
  registeredAt: string;
}

async function getProject(id: string): Promise<ProjectDetail | null> {
  try {
    const db = getDb();
    const doc = await db.collection(COLLECTIONS.REPOSITORIES).doc(id).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data();
    return {
      id: doc.id,
      url: data?.url || '',
      name: data?.name || '',
      localisedName: data?.localisedName || '',
      shortDescription: data?.shortDescription || data?.description || '',
      longDescription: data?.longDescription || '',
      description: data?.description || '',
      score: data?.score || 0,
      categories: data?.categories || [],
      disFase1: data?.disFase1 || false,
      owner: data?.owner || '',

      // Software info
      softwareVersion: data?.softwareVersion || '',
      releaseDate: data?.releaseDate || '',
      softwareType: data?.softwareType || '',
      platforms: data?.platforms || [],

      // Legal
      license: data?.license || '',
      mainCopyrightOwner: data?.mainCopyrightOwner || '',
      repoOwner: data?.repoOwner || '',

      // Status
      developmentStatus: data?.developmentStatus || '',
      maintenanceType: data?.maintenanceType || '',
      contacts: data?.contacts || [],
      contractors: data?.contractors || [],

      // Localisation
      localisationReady: data?.localisationReady || false,
      availableLanguages: data?.availableLanguages || [],

      // Rich content
      features: data?.features || [],
      documentation: data?.documentation || '',
      apiDocumentation: data?.apiDocumentation || '',
      screenshots: data?.screenshots || [],
      videos: data?.videos || [],
      landingURL: data?.landingURL || '',
      logo: data?.logo || '',

      // Dependencies
      dependsOn: data?.dependsOn || {},

      // Timestamps
      lastUpdated: data?.lastUpdated?.toDate?.()?.toISOString() || new Date().toISOString(),
      registeredAt: data?.registeredAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    return {
      title: 'Projekt hittades inte - SamhällsKodex',
    };
  }

  return {
    title: `${project.name} - SamhällsKodex`,
    description: project.shortDescription || `${project.name} - ett öppenkällkodsprojekt i svenska offentliga sektorn`,
  };
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params;
  const project = await getProject(id);

  if (!project) {
    notFound();
  }

  const hasContacts = project.contacts && project.contacts.length > 0;
  const hasFeatures = project.features && project.features.length > 0;
  const hasScreenshots = project.screenshots && project.screenshots.length > 0;
  const hasVideos = project.videos && project.videos.length > 0;
  const hasDependencies =
    (project.dependsOn?.open && project.dependsOn.open.length > 0) ||
    (project.dependsOn?.proprietary && project.dependsOn.proprietary.length > 0) ||
    (project.dependsOn?.hardware && project.dependsOn.hardware.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Tillbaka till katalogen
            </Link>
          </nav>

          {/* Project header */}
          <div className="rounded-2xl bg-white/5 p-6 backdrop-blur mb-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-start gap-4">
                {project.logo && (
                  <img
                    src={project.logo}
                    alt={`${project.name} logo`}
                    className="h-16 w-16 rounded-lg object-contain bg-white/10"
                  />
                )}
                <div>
                  <h1 className="text-3xl font-bold text-white">{project.name}</h1>
                  {project.localisedName && project.localisedName !== project.name && (
                    <p className="text-lg text-slate-300">{project.localisedName}</p>
                  )}
                  <p className="mt-1 text-slate-400">{project.owner}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {project.disFase1 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-medium text-emerald-400">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    DIS Fas 1
                  </span>
                )}
                <ScoreBadge score={project.score} />
              </div>
            </div>

            {/* Short description */}
            {project.shortDescription && (
              <p className="mt-4 text-lg text-slate-300">{project.shortDescription}</p>
            )}

            {/* Categories */}
            {project.categories.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {project.categories.map((cat) => (
                  <span
                    key={cat}
                    className="inline-flex items-center rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-300"
                  >
                    {getCategoryName(cat)}
                  </span>
                ))}
              </div>
            )}

            {/* Meta info grid */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <MetaItem label="Licens" value={project.license} />
              <MetaItem label="Status" value={getStatusName(project.developmentStatus)} />
              <MetaItem label="Underhåll" value={getMaintenanceName(project.maintenanceType)} />
              <MetaItem label="Senast uppdaterad" value={formatDate(project.lastUpdated)} />
              {project.softwareVersion && (
                <MetaItem label="Version" value={project.softwareVersion} />
              )}
              {project.releaseDate && (
                <MetaItem label="Utgivningsdatum" value={formatDate(project.releaseDate)} />
              )}
              {project.softwareType && (
                <MetaItem label="Typ" value={getSoftwareTypeName(project.softwareType)} />
              )}
              {project.platforms && project.platforms.length > 0 && (
                <MetaItem label="Plattformar" value={project.platforms.join(', ')} />
              )}
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 font-medium text-slate-900 hover:bg-slate-100 transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                Visa på GitHub
              </a>
              {project.landingURL && (
                <a
                  href={project.landingURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Webbplats
                </a>
              )}
              {project.documentation && (
                <a
                  href={project.documentation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 font-medium text-white hover:bg-slate-600 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Dokumentation
                </a>
              )}
              {project.apiDocumentation && (
                <a
                  href={project.apiDocumentation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 font-medium text-white hover:bg-slate-600 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  API-dokumentation
                </a>
              )}
            </div>
          </div>

          {/* Long description */}
          {project.longDescription && (
            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Om projektet</h2>
              <div className="prose prose-invert prose-slate max-w-none">
                <p className="text-slate-300 whitespace-pre-wrap">{project.longDescription}</p>
              </div>
            </div>
          )}

          {/* Features */}
          {hasFeatures && (
            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Funktioner</h2>
              <ul className="space-y-2">
                {project.features!.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Screenshots */}
          {hasScreenshots && (
            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Skärmdumpar</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {project.screenshots!.map((screenshot, index) => (
                  <a
                    key={index}
                    href={screenshot}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={screenshot}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-auto"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {hasVideos && (
            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Videor</h2>
              <div className="space-y-3">
                {project.videos!.map((video, index) => (
                  <a
                    key={index}
                    href={video}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <svg className="h-6 w-6 text-red-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    <span className="text-slate-300 truncate">{video}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Contacts */}
          {hasContacts && (
            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Kontakter</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {project.contacts!.map((contact, index) => (
                  <div key={index} className="rounded-lg bg-white/5 p-4">
                    <h3 className="font-medium text-white">{contact.name}</h3>
                    {contact.affiliation && (
                      <p className="text-sm text-slate-400">{contact.affiliation}</p>
                    )}
                    {contact.email && (
                      <a
                        href={`mailto:${contact.email}`}
                        className="mt-2 inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {contact.email}
                      </a>
                    )}
                    {contact.phone && (
                      <a
                        href={`tel:${contact.phone}`}
                        className="mt-1 inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {contact.phone}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dependencies */}
          {hasDependencies && (
            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Beroenden</h2>

              {project.dependsOn?.open && project.dependsOn.open.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-2">
                    Öppen källkod
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.dependsOn.open.map((dep, index) => (
                      <DependencyBadge key={index} dependency={dep} type="open" />
                    ))}
                  </div>
                </div>
              )}

              {project.dependsOn?.proprietary && project.dependsOn.proprietary.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-2">
                    Proprietär
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.dependsOn.proprietary.map((dep, index) => (
                      <DependencyBadge key={index} dependency={dep} type="proprietary" />
                    ))}
                  </div>
                </div>
              )}

              {project.dependsOn?.hardware && project.dependsOn.hardware.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-2">
                    Hårdvara
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {project.dependsOn.hardware.map((dep, index) => (
                      <DependencyBadge key={index} dependency={dep} type="hardware" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Localisation info */}
          {(project.localisationReady || (project.availableLanguages && project.availableLanguages.length > 0)) && (
            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur mb-6">
              <h2 className="text-xl font-semibold text-white mb-4">Lokalisering</h2>
              <div className="flex flex-wrap gap-4">
                {project.localisationReady && (
                  <div className="flex items-center gap-2 text-emerald-400">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Redo för lokalisering</span>
                  </div>
                )}
                {project.availableLanguages && project.availableLanguages.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Tillgängliga språk:</span>
                    <div className="flex flex-wrap gap-1">
                      {project.availableLanguages.map((lang) => (
                        <span
                          key={lang}
                          className="inline-flex items-center rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-300 uppercase"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Comments section */}
          <ProjectClient projectId={project.id} />
        </div>
      </div>
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const getColor = () => {
    if (score >= 80) return 'bg-emerald-500/20 text-emerald-400';
    if (score >= 70) return 'bg-lime-500/20 text-lime-400';
    if (score >= 60) return 'bg-yellow-500/20 text-yellow-400';
    return 'bg-orange-500/20 text-orange-400';
  };

  return (
    <div className={`rounded-lg px-3 py-1.5 ${getColor()}`}>
      <span className="text-2xl font-bold">{score}</span>
      <span className="ml-1 text-sm opacity-75">poäng</span>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500 uppercase tracking-wide">{label}</dt>
      <dd className="mt-1 text-sm text-white">{value}</dd>
    </div>
  );
}

function DependencyBadge({ dependency, type }: { dependency: Dependency; type: 'open' | 'proprietary' | 'hardware' }) {
  const colors = {
    open: 'bg-emerald-500/20 text-emerald-300',
    proprietary: 'bg-orange-500/20 text-orange-300',
    hardware: 'bg-purple-500/20 text-purple-300',
  };

  const version = dependency.versionMin
    ? dependency.versionMax
      ? `${dependency.versionMin} - ${dependency.versionMax}`
      : `>= ${dependency.versionMin}`
    : dependency.versionMax
      ? `<= ${dependency.versionMax}`
      : '';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm ${colors[type]}`}>
      {dependency.name}
      {version && <span className="text-xs opacity-75">({version})</span>}
      {dependency.optional && <span className="text-xs opacity-75">(valfri)</span>}
    </span>
  );
}

const CATEGORY_TRANSLATIONS: Record<string, string> = {
  'accounting': 'Bokföring',
  'case-management': 'Ärendehantering',
  'civic-engagement': 'Medborgarengagemang',
  'collaboration': 'Samarbete',
  'communications': 'Kommunikation',
  'content-management': 'Innehållshantering',
  'data-analytics': 'Dataanalys',
  'data-collection': 'Datainsamling',
  'document-management': 'Dokumenthantering',
  'digital-citizenship': 'Digital medborgarservice',
  'geographic-information-systems': 'GIS',
  'government-websites': 'Myndighetswebb',
  'healthcare': 'Hälso- och sjukvård',
  'help-desk': 'Helpdesk',
  'hr': 'Personal',
  'identity-management': 'Identitetshantering',
  'it-asset-management': 'IT-tillgångshantering',
  'it-development': 'IT-utveckling',
  'it-security': 'IT-säkerhet',
  'it-service-management': 'IT-tjänstehantering',
  'knowledge-management': 'Kunskapshantering',
  'learning-management-system': 'Lärandehantering',
  'local-government': 'Kommunal förvaltning',
  'marketing': 'Marknadsföring',
  'office': 'Kontorsproduktivitet',
  'procurement': 'Upphandling',
  'project-management': 'Projekthantering',
  'public-participation': 'Medborgardeltagande',
  'reporting-issues': 'Felanmälan',
  'social-media-management': 'Sociala medier',
  'social-services': 'Socialtjänst',
  'transportation': 'Transport',
  'visitor-management': 'Besökshantering',
  'voting': 'Röstning',
  'waste-management': 'Avfallshantering',
  'website-management': 'Webbhantering',
  'workflow-management': 'Arbetsflöden',
};

function getCategoryName(categoryId: string): string {
  return CATEGORY_TRANSLATIONS[categoryId] || categoryId;
}

function getStatusName(status: string): string {
  const names: Record<string, string> = {
    'concept': 'Koncept',
    'development': 'Under utveckling',
    'beta': 'Beta',
    'stable': 'Stabil',
    'obsolete': 'Föråldrad',
  };
  return names[status] || status;
}

function getMaintenanceName(type: string): string {
  const names: Record<string, string> = {
    'internal': 'Intern',
    'contract': 'Kontrakt',
    'community': 'Community',
    'none': 'Inget',
  };
  return names[type] || type;
}

function getSoftwareTypeName(type: string): string {
  const names: Record<string, string> = {
    'standalone/mobile': 'Mobilapp',
    'standalone/iot': 'IoT',
    'standalone/desktop': 'Skrivbordsprogram',
    'standalone/web': 'Webbapplikation',
    'standalone/backend': 'Backend',
    'standalone/other': 'Annat',
    'addon': 'Tillägg',
    'library': 'Bibliotek',
    'configurationFiles': 'Konfigurationsfiler',
  };
  return names[type] || type;
}

function formatDate(isoString: string): string {
  try {
    return new Date(isoString).toLocaleDateString('sv-SE');
  } catch {
    return 'Okänt';
  }
}
