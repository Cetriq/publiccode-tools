/**
 * x-samhallskodex profile scorer
 * Calculates a separate score (0-100%) for the profile extension
 */

import type { XSamhallskodexProfile } from '../types/x-samhallskodex.js';
import type {
  ProfileScoreResult,
  ProfileScoreBreakdown,
  ProfileSectionScore,
  ProfileScoreItem,
  ProfileSuggestion,
} from '../types/profile-score.js';
import { PROFILE_SCORE_WEIGHTS, PROFILE_FIELD_WEIGHTS } from '../types/profile-score.js';

type Language = 'sv' | 'en';

interface ScorerOptions {
  lang?: Language;
}

/**
 * Calculate profile score (0-100%)
 */
export function scoreProfile(
  profile: XSamhallskodexProfile | undefined,
  options: ScorerOptions = {}
): ProfileScoreResult {
  const lang = options.lang ?? 'sv';

  if (!profile) {
    return {
      total: 0,
      valid: false,
      breakdown: createEmptyBreakdown(),
      suggestions: [
        {
          message: lang === 'sv'
            ? 'Lägg till x-samhallskodex profil för att få profile score'
            : 'Add x-samhallskodex profile to get profile score',
          field: 'x-samhallskodex',
          potentialPoints: 100,
          priority: 'high',
        },
      ],
    };
  }

  const breakdown = calculateBreakdown(profile, lang);
  const suggestions = generateSuggestions(profile, breakdown, lang);

  // Calculate total from breakdown
  const total = Math.round(
    breakdown.profileVersion.percentage * (PROFILE_SCORE_WEIGHTS.profileVersion / 100) +
    breakdown.architecture.percentage * (PROFILE_SCORE_WEIGHTS.architecture / 100) +
    breakdown.integration.percentage * (PROFILE_SCORE_WEIGHTS.integration / 100) +
    breakdown.ai.percentage * (PROFILE_SCORE_WEIGHTS.ai / 100) +
    breakdown.quality.percentage * (PROFILE_SCORE_WEIGHTS.quality / 100) +
    breakdown.governance.percentage * (PROFILE_SCORE_WEIGHTS.governance / 100)
  );

  // Profile is valid if required fields are present
  const valid = !!(
    profile.profileVersion &&
    profile.architecture?.ui?.platform &&
    profile.architecture?.backend?.architecture &&
    profile.integration?.apiStyles?.length &&
    profile.ai?.enabled !== undefined &&
    profile.governance?.opennessLevel
  );

  return {
    total,
    valid,
    breakdown,
    suggestions,
  };
}

/**
 * Calculate breakdown by section
 */
function calculateBreakdown(profile: XSamhallskodexProfile, lang: Language): ProfileScoreBreakdown {
  return {
    profileVersion: scoreProfileVersion(profile, lang),
    architecture: scoreArchitecture(profile, lang),
    integration: scoreIntegration(profile, lang),
    ai: scoreAI(profile, lang),
    quality: scoreQuality(profile, lang),
    governance: scoreGovernance(profile, lang),
  };
}

/**
 * Score profileVersion section (5%)
 */
function scoreProfileVersion(profile: XSamhallskodexProfile, lang: Language): ProfileSectionScore {
  const items: ProfileScoreItem[] = [
    {
      field: 'profileVersion',
      label: lang === 'sv' ? 'Profilversion' : 'Profile Version',
      fulfilled: !!profile.profileVersion,
      points: profile.profileVersion ? 5 : 0,
      maxPoints: 5,
    },
  ];

  const earned = items.reduce((sum, item) => sum + item.points, 0);
  const max = items.reduce((sum, item) => sum + item.maxPoints, 0);

  return {
    earned,
    max,
    percentage: max > 0 ? Math.round((earned / max) * 100) : 0,
    items,
  };
}

/**
 * Score architecture section (25%)
 */
function scoreArchitecture(profile: XSamhallskodexProfile, lang: Language): ProfileSectionScore {
  const arch = profile.architecture;

  const items: ProfileScoreItem[] = [
    {
      field: 'architecture.ui.platform',
      label: lang === 'sv' ? 'UI-plattform' : 'UI Platform',
      fulfilled: !!arch?.ui?.platform,
      points: arch?.ui?.platform ? 5 : 0,
      maxPoints: 5,
    },
    {
      field: 'architecture.ui.framework',
      label: lang === 'sv' ? 'UI-ramverk' : 'UI Framework',
      fulfilled: !!arch?.ui?.framework,
      points: arch?.ui?.framework ? 5 : 0,
      maxPoints: 5,
    },
    {
      field: 'architecture.backend.architecture',
      label: lang === 'sv' ? 'Backend-arkitektur' : 'Backend Architecture',
      fulfilled: !!arch?.backend?.architecture,
      points: arch?.backend?.architecture ? 5 : 0,
      maxPoints: 5,
    },
    {
      field: 'architecture.backend.runtime',
      label: lang === 'sv' ? 'Backend-runtime' : 'Backend Runtime',
      fulfilled: !!arch?.backend?.runtime,
      points: arch?.backend?.runtime ? 5 : 0,
      maxPoints: 5,
    },
    {
      field: 'architecture.deployment.hosting',
      label: lang === 'sv' ? 'Hosting-modell' : 'Hosting Model',
      fulfilled: !!arch?.deployment?.hosting,
      points: arch?.deployment?.hosting ? 5 : 0,
      maxPoints: 5,
    },
  ];

  const earned = items.reduce((sum, item) => sum + item.points, 0);
  const max = items.reduce((sum, item) => sum + item.maxPoints, 0);

  return {
    earned,
    max,
    percentage: max > 0 ? Math.round((earned / max) * 100) : 0,
    items,
  };
}

/**
 * Score integration section (20%)
 */
function scoreIntegration(profile: XSamhallskodexProfile, lang: Language): ProfileSectionScore {
  const integration = profile.integration;

  const items: ProfileScoreItem[] = [
    {
      field: 'integration.apiStyles',
      label: lang === 'sv' ? 'API-stilar' : 'API Styles',
      fulfilled: !!(integration?.apiStyles?.length && integration.apiStyles.length > 0),
      points: integration?.apiStyles?.length ? 10 : 0,
      maxPoints: 10,
    },
    {
      field: 'integration.identity',
      label: lang === 'sv' ? 'Identitetsmetoder' : 'Identity Methods',
      fulfilled: !!(integration?.identity?.length && integration.identity.length > 0),
      points: integration?.identity?.length ? 10 : 0,
      maxPoints: 10,
    },
  ];

  const earned = items.reduce((sum, item) => sum + item.points, 0);
  const max = items.reduce((sum, item) => sum + item.maxPoints, 0);

  return {
    earned,
    max,
    percentage: max > 0 ? Math.round((earned / max) * 100) : 0,
    items,
  };
}

/**
 * Score AI section (15%)
 */
function scoreAI(profile: XSamhallskodexProfile, lang: Language): ProfileSectionScore {
  const ai = profile.ai;

  const items: ProfileScoreItem[] = [
    {
      field: 'ai.enabled',
      label: lang === 'sv' ? 'AI aktiverat' : 'AI Enabled',
      fulfilled: ai?.enabled !== undefined,
      points: ai?.enabled !== undefined ? 5 : 0,
      maxPoints: 5,
    },
    {
      field: 'ai.useCases',
      label: lang === 'sv' ? 'AI-användningsfall' : 'AI Use Cases',
      // Only score if AI is enabled
      fulfilled: !ai?.enabled || !!(ai?.useCases?.length && ai.useCases.length > 0),
      points: !ai?.enabled || (ai?.useCases?.length && ai.useCases.length > 0) ? 5 : 0,
      maxPoints: 5,
    },
    {
      field: 'ai.humanInLoop',
      label: lang === 'sv' ? 'Mänsklig kontroll' : 'Human in Loop',
      fulfilled: !ai?.enabled || ai?.humanInLoop !== undefined,
      points: !ai?.enabled || ai?.humanInLoop !== undefined ? 5 : 0,
      maxPoints: 5,
    },
  ];

  const earned = items.reduce((sum, item) => sum + item.points, 0);
  const max = items.reduce((sum, item) => sum + item.maxPoints, 0);

  return {
    earned,
    max,
    percentage: max > 0 ? Math.round((earned / max) * 100) : 0,
    items,
  };
}

/**
 * Score quality section (15%)
 */
function scoreQuality(profile: XSamhallskodexProfile, lang: Language): ProfileSectionScore {
  const quality = profile.quality;

  const items: ProfileScoreItem[] = [
    {
      field: 'quality.uxRating',
      label: lang === 'sv' ? 'UX-betyg' : 'UX Rating',
      fulfilled: !!quality?.uxRating,
      points: quality?.uxRating ? 5 : 0,
      maxPoints: 5,
    },
    {
      field: 'quality.apiMaturity',
      label: lang === 'sv' ? 'API-mognad' : 'API Maturity',
      fulfilled: !!quality?.apiMaturity,
      points: quality?.apiMaturity ? 5 : 0,
      maxPoints: 5,
    },
    {
      field: 'quality.documentationMaturity',
      label: lang === 'sv' ? 'Dokumentationsmognad' : 'Documentation Maturity',
      fulfilled: !!quality?.documentationMaturity,
      points: quality?.documentationMaturity ? 5 : 0,
      maxPoints: 5,
    },
  ];

  const earned = items.reduce((sum, item) => sum + item.points, 0);
  const max = items.reduce((sum, item) => sum + item.maxPoints, 0);

  return {
    earned,
    max,
    percentage: max > 0 ? Math.round((earned / max) * 100) : 0,
    items,
  };
}

/**
 * Score governance section (20%)
 */
function scoreGovernance(profile: XSamhallskodexProfile, lang: Language): ProfileSectionScore {
  const governance = profile.governance;

  const items: ProfileScoreItem[] = [
    {
      field: 'governance.opennessLevel',
      label: lang === 'sv' ? 'Öppenhetsnivå' : 'Openness Level',
      fulfilled: !!governance?.opennessLevel,
      points: governance?.opennessLevel ? 10 : 0,
      maxPoints: 10,
    },
    {
      field: 'governance.dataHosting.locality',
      label: lang === 'sv' ? 'Datalokalitet' : 'Data Locality',
      fulfilled: !!governance?.dataHosting?.locality,
      points: governance?.dataHosting?.locality ? 5 : 0,
      maxPoints: 5,
    },
    {
      field: 'governance.vendorDependency',
      label: lang === 'sv' ? 'Leverantörsberoende' : 'Vendor Dependency',
      fulfilled: !!governance?.vendorDependency,
      points: governance?.vendorDependency ? 5 : 0,
      maxPoints: 5,
    },
  ];

  const earned = items.reduce((sum, item) => sum + item.points, 0);
  const max = items.reduce((sum, item) => sum + item.maxPoints, 0);

  return {
    earned,
    max,
    percentage: max > 0 ? Math.round((earned / max) * 100) : 0,
    items,
  };
}

/**
 * Generate suggestions for improvement
 */
function generateSuggestions(
  profile: XSamhallskodexProfile,
  breakdown: ProfileScoreBreakdown,
  lang: Language
): ProfileSuggestion[] {
  const suggestions: ProfileSuggestion[] = [];

  // Check each section for missing items
  for (const section of Object.values(breakdown)) {
    for (const item of section.items) {
      if (!item.fulfilled) {
        suggestions.push({
          message: lang === 'sv'
            ? `Lägg till ${item.label.toLowerCase()}`
            : `Add ${item.label.toLowerCase()}`,
          field: item.field,
          potentialPoints: item.maxPoints,
          priority: item.maxPoints >= 10 ? 'high' : item.maxPoints >= 5 ? 'medium' : 'low',
        });
      }
    }
  }

  // Sort by potential points (descending)
  suggestions.sort((a, b) => b.potentialPoints - a.potentialPoints);

  return suggestions;
}

/**
 * Create empty breakdown structure
 */
function createEmptyBreakdown(): ProfileScoreBreakdown {
  const emptySection: ProfileSectionScore = {
    earned: 0,
    max: 0,
    percentage: 0,
    items: [],
  };

  return {
    profileVersion: emptySection,
    architecture: emptySection,
    integration: emptySection,
    ai: emptySection,
    quality: emptySection,
    governance: emptySection,
  };
}
