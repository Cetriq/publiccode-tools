'use client';

import { useState } from 'react';
import type { XSamhallskodexProfile } from '@samhallskodex/core';

// Import types and arrays from core - these need to be client-safe exports
const UI_PLATFORMS = ['web', 'desktop', 'mobile', 'cli', 'api', 'embedded', 'none', 'other'] as const;
const BACKEND_ARCHITECTURES = ['container', 'vm', 'serverless', 'native', 'mixed'] as const;
const API_STYLES = ['rest', 'graphql', 'grpc', 'soap', 'odata', 'websocket', 'none'] as const;
const IDENTITY_METHODS = [
  'oidc', 'oauth2', 'saml', 'ldap', 'ad', 'bankid', 'freja', 'eidas', 'siths',
  'basic-auth', 'api-key', 'jwt', 'none', 'other'
] as const;
const OPENNESS_LEVELS = ['open-source', 'open-core', 'source-available', 'proprietary'] as const;
const DATA_LOCALITIES = ['municipality', 'sweden', 'eu', 'non-eu', 'hybrid', 'unknown'] as const;
const AI_USE_CASES = [
  'assistant', 'chatbot', 'summarization', 'classification', 'extraction',
  'translation', 'transcription', 'recommendation', 'decision-support',
  'anomaly-detection', 'forecasting', 'image-recognition', 'document-processing',
  'code-generation', 'search', 'other'
] as const;

// Swedish labels for UI
const LABELS: Record<string, string> = {
  // UI Platforms
  'web': 'Webb',
  'desktop': 'Desktop',
  'mobile': 'Mobil',
  'cli': 'Kommandorad (CLI)',
  'api': 'API (headless)',
  'embedded': 'Inbyggt system',
  'none': 'Inget',
  'other': 'Övrigt',

  // Backend Architectures
  'container': 'Container',
  'vm': 'Virtuell maskin',
  'serverless': 'Serverless',
  'native': 'Native/Binär',
  'mixed': 'Blandad',

  // API Styles
  'rest': 'REST',
  'graphql': 'GraphQL',
  'grpc': 'gRPC',
  'soap': 'SOAP',
  'odata': 'OData',
  'websocket': 'WebSocket',

  // Openness Levels
  'open-source': 'Öppen källkod',
  'open-core': 'Öppen kärna',
  'source-available': 'Källkod tillgänglig',
  'proprietary': 'Proprietär',

  // Data Locality
  'municipality': 'Kommun',
  'sweden': 'Sverige',
  'eu': 'EU',
  'non-eu': 'Utanför EU',
  'hybrid': 'Hybrid',
  'unknown': 'Okänd',

  // Identity Methods
  'oidc': 'OpenID Connect',
  'oauth2': 'OAuth 2.0',
  'saml': 'SAML',
  'ldap': 'LDAP',
  'ad': 'Active Directory',
  'bankid': 'BankID',
  'freja': 'Freja eID',
  'eidas': 'eIDAS',
  'siths': 'SITHS',
  'basic-auth': 'Basic Auth',
  'api-key': 'API-nyckel',
  'jwt': 'JWT',

  // AI Use Cases
  'assistant': 'Assistent',
  'chatbot': 'Chattbot',
  'summarization': 'Sammanfattning',
  'classification': 'Klassificering',
  'extraction': 'Extraktion',
  'translation': 'Översättning',
  'transcription': 'Transkription',
  'recommendation': 'Rekommendation',
  'decision-support': 'Beslutsstöd',
  'anomaly-detection': 'Anomalidetektion',
  'forecasting': 'Prognostisering',
  'image-recognition': 'Bildigenkänning',
  'document-processing': 'Dokumentbehandling',
  'code-generation': 'Kodgenerering',
  'search': 'Sökning',
};

interface ProfileSectionProps {
  profile: Partial<XSamhallskodexProfile> | undefined;
  onUpdate: (profile: Partial<XSamhallskodexProfile>) => void;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export function ProfileSection({ profile, onUpdate, enabled, onToggle }: ProfileSectionProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['architecture']));

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  const updateProfile = (path: string, value: unknown) => {
    const newProfile = { ...profile } as Record<string, unknown>;

    // Handle nested paths like 'architecture.ui.platform'
    const parts = path.split('.');
    let current = newProfile;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) {
        current[parts[i]] = {};
      }
      current = current[parts[i]] as Record<string, unknown>;
    }
    current[parts[parts.length - 1]] = value;

    // Ensure profileVersion is always set
    if (!newProfile.profileVersion) {
      newProfile.profileVersion = '0.1';
    }

    onUpdate(newProfile as Partial<XSamhallskodexProfile>);
  };

  return (
    <div className="space-y-6">
      {/* Enable/Disable toggle */}
      <div className="flex items-center justify-between rounded-xl border border-slate-600 bg-slate-800/50 p-4">
        <div>
          <h3 className="text-lg font-semibold text-white">x-samhallskodex Profil</h3>
          <p className="text-sm text-slate-400">
            Teknisk metadata för svenska offentlig sektor-projekt
          </p>
        </div>
        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => onToggle(e.target.checked)}
            className="peer sr-only"
          />
          <div className="peer h-6 w-11 rounded-full bg-slate-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
        </label>
      </div>

      {enabled && (
        <div className="space-y-4">
          {/* Architecture Section */}
          <CollapsibleSection
            title="Arkitektur"
            description="UI-plattform och backend"
            expanded={expandedSections.has('architecture')}
            onToggle={() => toggleSection('architecture')}
          >
            <div className="space-y-4">
              {/* UI Platform */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  UI-plattform *
                </label>
                <select
                  value={(profile?.architecture?.ui?.platform as string) || ''}
                  onChange={(e) => updateProfile('architecture.ui.platform', e.target.value)}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2.5 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Välj plattform...</option>
                  {UI_PLATFORMS.map((p) => (
                    <option key={p} value={p}>{LABELS[p] || p}</option>
                  ))}
                </select>
              </div>

              {/* UI Framework */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  UI-ramverk
                </label>
                <input
                  type="text"
                  value={(profile?.architecture?.ui?.framework as string) || ''}
                  onChange={(e) => updateProfile('architecture.ui.framework', e.target.value)}
                  placeholder="t.ex. React, Vue, Angular"
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2.5 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Backend Architecture */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Backend-arkitektur *
                </label>
                <select
                  value={(profile?.architecture?.backend?.architecture as string) || ''}
                  onChange={(e) => updateProfile('architecture.backend.architecture', e.target.value)}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2.5 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Välj arkitektur...</option>
                  {BACKEND_ARCHITECTURES.map((a) => (
                    <option key={a} value={a}>{LABELS[a] || a}</option>
                  ))}
                </select>
              </div>

              {/* Backend Runtime */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Backend-runtime
                </label>
                <input
                  type="text"
                  value={(profile?.architecture?.backend?.runtime as string) || ''}
                  onChange={(e) => updateProfile('architecture.backend.runtime', e.target.value)}
                  placeholder="t.ex. Node.js, .NET, Java"
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2.5 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* Integration Section */}
          <CollapsibleSection
            title="Integration"
            description="API-stilar och identitetsmetoder"
            expanded={expandedSections.has('integration')}
            onToggle={() => toggleSection('integration')}
          >
            <div className="space-y-4">
              {/* API Styles */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  API-stilar *
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {API_STYLES.map((style) => (
                    <label
                      key={style}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                        (profile?.integration?.apiStyles as string[] || []).includes(style)
                          ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                          : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={(profile?.integration?.apiStyles as string[] || []).includes(style)}
                        onChange={(e) => {
                          const current = (profile?.integration?.apiStyles as string[]) || [];
                          const updated = e.target.checked
                            ? [...current, style]
                            : current.filter((s) => s !== style);
                          updateProfile('integration.apiStyles', updated);
                        }}
                        className="sr-only"
                      />
                      {LABELS[style] || style}
                    </label>
                  ))}
                </div>
              </div>

              {/* Identity Methods */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Identitetsmetoder
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {IDENTITY_METHODS.map((method) => (
                    <label
                      key={method}
                      className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                        (profile?.integration?.identity as string[] || []).includes(method)
                          ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                          : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={(profile?.integration?.identity as string[] || []).includes(method)}
                        onChange={(e) => {
                          const current = (profile?.integration?.identity as string[]) || [];
                          const updated = e.target.checked
                            ? [...current, method]
                            : current.filter((m) => m !== method);
                          updateProfile('integration.identity', updated);
                        }}
                        className="sr-only"
                      />
                      {LABELS[method] || method}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleSection>

          {/* AI Section */}
          <CollapsibleSection
            title="AI"
            description="AI-funktionalitet och användningsfall"
            expanded={expandedSections.has('ai')}
            onToggle={() => toggleSection('ai')}
          >
            <div className="space-y-4">
              {/* AI Enabled */}
              <div className="flex items-center gap-3">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={profile?.ai?.enabled || false}
                    onChange={(e) => updateProfile('ai.enabled', e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-slate-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
                <span className="text-sm text-slate-300">Använder AI-funktionalitet *</span>
              </div>

              {profile?.ai?.enabled && (
                <>
                  {/* AI Use Cases */}
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      AI-användningsfall
                    </label>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {AI_USE_CASES.map((useCase) => (
                        <label
                          key={useCase}
                          className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                            (profile?.ai?.useCases as string[] || []).includes(useCase)
                              ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                              : 'border-slate-600 bg-slate-700/50 text-slate-300 hover:border-slate-500'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={(profile?.ai?.useCases as string[] || []).includes(useCase)}
                            onChange={(e) => {
                              const current = (profile?.ai?.useCases as string[]) || [];
                              const updated = e.target.checked
                                ? [...current, useCase]
                                : current.filter((uc) => uc !== useCase);
                              updateProfile('ai.useCases', updated);
                            }}
                            className="sr-only"
                          />
                          {LABELS[useCase] || useCase}
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Human in Loop */}
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={profile?.ai?.humanInLoop || false}
                        onChange={(e) => updateProfile('ai.humanInLoop', e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-slate-600 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                    </label>
                    <span className="text-sm text-slate-300">Kräver mänsklig kontroll (Human in Loop)</span>
                  </div>
                </>
              )}
            </div>
          </CollapsibleSection>

          {/* Governance Section */}
          <CollapsibleSection
            title="Styrning"
            description="Öppenhet och datalokalitet"
            expanded={expandedSections.has('governance')}
            onToggle={() => toggleSection('governance')}
          >
            <div className="space-y-4">
              {/* Openness Level */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Öppenhetsnivå *
                </label>
                <select
                  value={(profile?.governance?.opennessLevel as string) || ''}
                  onChange={(e) => updateProfile('governance.opennessLevel', e.target.value)}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2.5 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Välj öppenhetsnivå...</option>
                  {OPENNESS_LEVELS.map((level) => (
                    <option key={level} value={level}>{LABELS[level] || level}</option>
                  ))}
                </select>
              </div>

              {/* Data Locality */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-300">
                  Datalokalitet
                </label>
                <select
                  value={(profile?.governance?.dataHosting?.locality as string) || ''}
                  onChange={(e) => updateProfile('governance.dataHosting.locality', e.target.value)}
                  className="w-full rounded-lg border border-slate-600 bg-slate-700 px-4 py-2.5 text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="">Välj datalokalitet...</option>
                  {DATA_LOCALITIES.map((locality) => (
                    <option key={locality} value={locality}>{LABELS[locality] || locality}</option>
                  ))}
                </select>
              </div>
            </div>
          </CollapsibleSection>
        </div>
      )}
    </div>
  );
}

// Collapsible section helper component
function CollapsibleSection({
  title,
  description,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  description: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-600 bg-slate-800/50 overflow-hidden">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-slate-700/30 transition"
      >
        <div>
          <h4 className="font-semibold text-white">{title}</h4>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
        <svg
          className={`h-5 w-5 text-slate-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="border-t border-slate-600 p-4">
          {children}
        </div>
      )}
    </div>
  );
}

export default ProfileSection;
