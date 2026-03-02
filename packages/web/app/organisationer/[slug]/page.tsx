import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getFirebaseAdmin, COLLECTIONS } from '@/lib/firebase';
import type { Organization, ServiceType } from '@/types/organization';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Labels for organization types
const ORG_TYPE_LABELS: Record<string, string> = {
  municipality: 'Kommun',
  region: 'Region',
  public_sector: 'Offentlig sektor',
  developer: 'Utvecklare',
  service_provider: 'Tjänsteleverantör',
};

// Labels for service types
const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  support: 'Support & underhåll',
  hosting: 'Hosting & drift',
  development: 'Utveckling',
  training: 'Utbildning',
  consulting: 'Konsulting',
  integration: 'Integration',
  migration: 'Migrering',
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getOrganizationBySlug(slug: string) {
  const { db } = getFirebaseAdmin();

  // Query by slug
  const snapshot = await db
    .collection(COLLECTIONS.ORGANIZATIONS)
    .where('slug', '==', slug)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  const data = doc.data() as Organization;

  return {
    ...data,
    id: doc.id, // Ensure doc.id overrides data.id if it exists
  };
}

export default async function OrganizationPublicPage({ params }: PageProps) {
  const { slug } = await params;
  const org = await getOrganizationBySlug(slug);

  if (!org) {
    notFound();
  }

  const isServiceProvider = org.type === 'service_provider';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-24 pb-16">
      <div className="mx-auto max-w-4xl px-4">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm">
          <Link href="/leverantorer" className="text-slate-400 hover:text-white">
            Leverantörer
          </Link>
          <span className="mx-2 text-slate-600">/</span>
          <span className="text-white">{org.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-8 flex items-start gap-6">
          <img
            src={org.avatarUrl}
            alt={org.name}
            className="h-24 w-24 rounded-xl"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-white">{org.name}</h1>
              {org.verified && (
                <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-sm font-medium text-green-300">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Verifierad
                </span>
              )}
            </div>
            <p className="mt-2 text-lg text-slate-300">
              {ORG_TYPE_LABELS[org.type] || org.type}
            </p>
            {org.location && (
              <p className="mt-1 text-sm text-slate-400 flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {org.location}
              </p>
            )}
          </div>
        </div>

        {/* Description */}
        {org.description && (
          <div className="mb-8 rounded-2xl bg-white/5 p-6 backdrop-blur">
            <h2 className="mb-3 text-lg font-semibold text-white">Om oss</h2>
            <p className="text-slate-300 whitespace-pre-wrap">{org.description}</p>
          </div>
        )}

        {/* Service Offerings */}
        {isServiceProvider && org.serviceOfferings && org.serviceOfferings.length > 0 && (
          <div className="mb-8 rounded-2xl bg-white/5 p-6 backdrop-blur">
            <h2 className="mb-4 text-lg font-semibold text-white">Tjänster vi erbjuder</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {org.serviceOfferings.map((offering, index) => (
                <div
                  key={index}
                  className="rounded-lg bg-white/5 p-4 border border-white/10"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20">
                      <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="font-medium text-white">
                      {SERVICE_TYPE_LABELS[offering.type] || offering.type}
                    </span>
                  </div>
                  {offering.description && (
                    <p className="mt-2 text-sm text-slate-400">{offering.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Supported Projects */}
        {isServiceProvider && org.supportedProjects && org.supportedProjects.length > 0 && (
          <div className="mb-8 rounded-2xl bg-white/5 p-6 backdrop-blur">
            <h2 className="mb-4 text-lg font-semibold text-white">Projekt vi stödjer</h2>
            <div className="flex flex-wrap gap-2">
              {org.supportedProjects.map((project, index) => (
                <Link
                  key={index}
                  href={`/catalog/${project.projectId}`}
                  className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20 transition-colors"
                >
                  {project.projectId}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="mb-8 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 p-6">
          <h2 className="mb-4 text-lg font-semibold text-white">Kontakta oss</h2>
          <div className="flex flex-wrap gap-4">
            {org.website && (
              <a
                href={org.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-white hover:bg-white/20 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Webbplats
              </a>
            )}
            {org.contactEmail && (
              <a
                href={`mailto:${org.contactEmail}`}
                className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-white hover:bg-white/20 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Skicka e-post
              </a>
            )}
          </div>
          {!org.website && !org.contactEmail && (
            <p className="text-slate-400">Ingen kontaktinformation tillgänglig.</p>
          )}
        </div>

        {/* Company Info */}
        {org.employeeCount && (
          <div className="rounded-2xl bg-white/5 p-6 backdrop-blur">
            <h2 className="mb-4 text-lg font-semibold text-white">Företagsinformation</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {org.employeeCount && (
                <div>
                  <span className="text-sm text-slate-400">Antal anställda</span>
                  <p className="text-white">{org.employeeCount}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
