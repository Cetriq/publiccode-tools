/**
 * DIS-Readiness Score rules
 * Based on SPEC.md scoring criteria
 */

import type { PublicCode, Category } from '../types/publiccode.js';
import type { ScoreItem, Suggestion } from '../types/score.js';
import { DIS_FASE1_CATEGORIES } from '../types/categories.js';

export type Language = 'sv' | 'en';

/**
 * Required fields scoring (40 points max)
 */
export function scoreRequiredFields(
  data: PublicCode,
  lang: Language
): { items: ScoreItem[]; suggestions: Suggestion[] } {
  const items: ScoreItem[] = [];
  const suggestions: Suggestion[] = [];

  // name: 5p
  items.push({
    name: 'name',
    score: data.name ? 5 : 0,
    maxScore: 5,
    met: !!data.name,
  });

  // url: 5p
  items.push({
    name: 'url',
    score: data.url ? 5 : 0,
    maxScore: 5,
    met: !!data.url,
  });

  // softwareVersion: 3p
  const hasVersion = !!data.softwareVersion;
  items.push({
    name: 'softwareVersion',
    score: hasVersion ? 3 : 0,
    maxScore: 3,
    met: hasVersion,
  });
  if (!hasVersion) {
    suggestions.push({
      message:
        lang === 'sv'
          ? 'Lägg till softwareVersion'
          : 'Add softwareVersion',
      potentialPoints: 3,
      priority: 'medium',
    });
  }

  // releaseDate: 2p
  const hasReleaseDate = !!data.releaseDate;
  items.push({
    name: 'releaseDate',
    score: hasReleaseDate ? 2 : 0,
    maxScore: 2,
    met: hasReleaseDate,
  });
  if (!hasReleaseDate) {
    suggestions.push({
      message:
        lang === 'sv' ? 'Lägg till releaseDate' : 'Add releaseDate',
      potentialPoints: 2,
      priority: 'low',
    });
  }

  // platforms: 3p
  const hasPlatforms = data.platforms && data.platforms.length > 0;
  items.push({
    name: 'platforms',
    score: hasPlatforms ? 3 : 0,
    maxScore: 3,
    met: hasPlatforms,
  });

  // categories: 5p
  const hasCategories = data.categories && data.categories.length > 0;
  items.push({
    name: 'categories',
    score: hasCategories ? 5 : 0,
    maxScore: 5,
    met: hasCategories,
  });

  // developmentStatus: 3p
  items.push({
    name: 'developmentStatus',
    score: data.developmentStatus ? 3 : 0,
    maxScore: 3,
    met: !!data.developmentStatus,
  });

  // softwareType: 2p
  items.push({
    name: 'softwareType',
    score: data.softwareType ? 2 : 0,
    maxScore: 2,
    met: !!data.softwareType,
  });

  // description (at least one): 5p
  const hasDescription =
    data.description && Object.keys(data.description).length > 0;
  items.push({
    name: 'description',
    score: hasDescription ? 5 : 0,
    maxScore: 5,
    met: hasDescription,
  });

  // legal.license: 4p
  const hasLicense = !!data.legal?.license;
  items.push({
    name: 'legal.license',
    score: hasLicense ? 4 : 0,
    maxScore: 4,
    met: hasLicense,
  });

  // legal.repoOwner: 3p
  const hasRepoOwner = !!data.legal?.repoOwner;
  items.push({
    name: 'legal.repoOwner',
    score: hasRepoOwner ? 3 : 0,
    maxScore: 3,
    met: hasRepoOwner,
  });

  return { items, suggestions };
}

/**
 * Documentation scoring (20 points max)
 */
export function scoreDocumentation(
  data: PublicCode,
  lang: Language
): { items: ScoreItem[]; suggestions: Suggestion[] } {
  const items: ScoreItem[] = [];
  const suggestions: Suggestion[] = [];

  const descriptions = Object.values(data.description || {});

  // longDescription >500 chars: 5p
  const hasLongDesc = descriptions.some(
    (d) => d.longDescription && d.longDescription.length > 500
  );
  items.push({
    name: 'longDescription',
    score: hasLongDesc ? 5 : 0,
    maxScore: 5,
    met: hasLongDesc,
  });
  if (!hasLongDesc) {
    suggestions.push({
      message:
        lang === 'sv'
          ? 'Lägg till en detaljerad longDescription (>500 tecken)'
          : 'Add a detailed longDescription (>500 characters)',
      potentialPoints: 5,
      priority: 'medium',
    });
  }

  // documentation URL: 5p
  const hasDocUrl = descriptions.some((d) => d.documentation);
  items.push({
    name: 'documentation',
    score: hasDocUrl ? 5 : 0,
    maxScore: 5,
    met: hasDocUrl,
  });
  if (!hasDocUrl) {
    suggestions.push({
      message:
        lang === 'sv'
          ? 'Lägg till en dokumentations-URL'
          : 'Add a documentation URL',
      potentialPoints: 5,
      priority: 'medium',
    });
  }

  // screenshots (at least 1): 5p
  const hasScreenshots = descriptions.some(
    (d) => d.screenshots && d.screenshots.length > 0
  );
  items.push({
    name: 'screenshots',
    score: hasScreenshots ? 5 : 0,
    maxScore: 5,
    met: hasScreenshots,
  });
  if (!hasScreenshots) {
    suggestions.push({
      message:
        lang === 'sv'
          ? 'Lägg till screenshots'
          : 'Add screenshots',
      potentialPoints: 5,
      priority: 'high',
    });
  }

  // features (at least 3): 3p
  const hasFeatures = descriptions.some(
    (d) => d.features && d.features.length >= 3
  );
  items.push({
    name: 'features',
    score: hasFeatures ? 3 : 0,
    maxScore: 3,
    met: hasFeatures,
  });
  if (!hasFeatures) {
    suggestions.push({
      message:
        lang === 'sv'
          ? 'Lägg till minst 3 features'
          : 'Add at least 3 features',
      potentialPoints: 3,
      priority: 'low',
    });
  }

  // videos: 2p
  const hasVideos = descriptions.some((d) => d.videos && d.videos.length > 0);
  items.push({
    name: 'videos',
    score: hasVideos ? 2 : 0,
    maxScore: 2,
    met: hasVideos,
  });

  return { items, suggestions };
}

/**
 * Localisation scoring (15 points max)
 */
export function scoreLocalisation(
  data: PublicCode,
  lang: Language
): { items: ScoreItem[]; suggestions: Suggestion[] } {
  const items: ScoreItem[] = [];
  const suggestions: Suggestion[] = [];

  // description.sv exists: 8p
  const hasSwedishDesc = !!data.description?.sv;
  items.push({
    name: 'description.sv',
    score: hasSwedishDesc ? 8 : 0,
    maxScore: 8,
    met: hasSwedishDesc,
  });
  if (!hasSwedishDesc) {
    suggestions.push({
      message:
        lang === 'sv'
          ? 'Lägg till en svensk beskrivning (description.sv)'
          : 'Add a Swedish description (description.sv)',
      potentialPoints: 8,
      priority: 'high',
    });
  }

  // contact with Swedish email/phone: 4p
  const contacts = data.maintenance?.contacts || [];
  const hasSwedishContact = contacts.some(
    (c) =>
      (c.email && c.email.endsWith('.se')) ||
      (c.phone && c.phone.startsWith('+46'))
  );
  items.push({
    name: 'swedishContact',
    score: hasSwedishContact ? 4 : 0,
    maxScore: 4,
    met: hasSwedishContact,
  });
  if (!hasSwedishContact && contacts.length > 0) {
    suggestions.push({
      message:
        lang === 'sv'
          ? 'Lägg till en svensk kontaktperson (e-post slutar på .se eller telefon börjar med +46)'
          : 'Add a Swedish contact (email ends with .se or phone starts with +46)',
      potentialPoints: 4,
      priority: 'medium',
    });
  }

  // localisation.availableLanguages includes 'sv': 3p
  const hasSwedishLang = data.localisation?.availableLanguages?.includes('sv') ?? false;
  items.push({
    name: 'localisation.sv',
    score: hasSwedishLang ? 3 : 0,
    maxScore: 3,
    met: hasSwedishLang,
  });
  if (!hasSwedishLang) {
    suggestions.push({
      message:
        lang === 'sv'
          ? "Lägg till 'sv' i localisation.availableLanguages"
          : "Add 'sv' to localisation.availableLanguages",
      potentialPoints: 3,
      priority: 'medium',
    });
  }

  return { items, suggestions };
}

/**
 * Maintenance scoring (15 points max)
 */
export function scoreMaintenance(
  data: PublicCode,
  lang: Language
): { items: ScoreItem[]; suggestions: Suggestion[] } {
  const items: ScoreItem[] = [];
  const suggestions: Suggestion[] = [];

  // maintenance.type = 'internal' or 'contract': 5p
  const hasActiveType =
    data.maintenance?.type === 'internal' ||
    data.maintenance?.type === 'contract';
  items.push({
    name: 'maintenance.type',
    score: hasActiveType ? 5 : 0,
    maxScore: 5,
    met: hasActiveType,
  });
  if (!hasActiveType) {
    suggestions.push({
      message:
        lang === 'sv'
          ? "Sätt maintenance.type till 'internal' eller 'contract'"
          : "Set maintenance.type to 'internal' or 'contract'",
      potentialPoints: 5,
      priority: 'medium',
    });
  }

  // maintenance.contacts exists: 5p
  const hasContacts =
    (data.maintenance?.contacts && data.maintenance.contacts.length > 0) ?? false;
  items.push({
    name: 'maintenance.contacts',
    score: hasContacts ? 5 : 0,
    maxScore: 5,
    met: !!hasContacts,
  });
  if (!hasContacts) {
    suggestions.push({
      message:
        lang === 'sv'
          ? 'Lägg till maintenance.contacts'
          : 'Add maintenance.contacts',
      potentialPoints: 5,
      priority: 'high',
    });
  }

  // releaseDate within 6 months: 5p
  let recentRelease = false;
  if (data.releaseDate) {
    const releaseDate = new Date(data.releaseDate);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    recentRelease = releaseDate >= sixMonthsAgo;
  }
  items.push({
    name: 'recentRelease',
    score: recentRelease ? 5 : 0,
    maxScore: 5,
    met: recentRelease,
  });
  if (!recentRelease && data.releaseDate) {
    suggestions.push({
      message:
        lang === 'sv'
          ? 'Uppdatera releaseDate till senaste release (inom 6 månader)'
          : 'Update releaseDate to latest release (within 6 months)',
      potentialPoints: 5,
      priority: 'low',
    });
  }

  return { items, suggestions };
}

/**
 * DIS-specific scoring (10 points max)
 */
export function scoreDISSpecific(
  data: PublicCode,
  lang: Language
): { items: ScoreItem[]; suggestions: Suggestion[] } {
  const items: ScoreItem[] = [];
  const suggestions: Suggestion[] = [];

  // Category matches DIS Phase 1: 5p
  const categories = data.categories || [];
  const hasDISCategory = categories.some((cat: Category) =>
    DIS_FASE1_CATEGORIES.includes(cat)
  );
  items.push({
    name: 'disFase1Category',
    score: hasDISCategory ? 5 : 0,
    maxScore: 5,
    met: hasDISCategory,
  });
  if (!hasDISCategory && categories.length > 0) {
    suggestions.push({
      message:
        lang === 'sv'
          ? 'Överväg att lägga till en DIS Fas 1-kategori (CASE_MANAGEMENT, CIVIC_ENGAGEMENT, DATA_ANALYTICS, etc.)'
          : 'Consider adding a DIS Phase 1 category (CASE_MANAGEMENT, CIVIC_ENGAGEMENT, DATA_ANALYTICS, etc.)',
      potentialPoints: 5,
      priority: 'low',
    });
  }

  // At least 2 categories: 3p
  const hasMultipleCategories = categories.length >= 2;
  items.push({
    name: 'multipleCategories',
    score: hasMultipleCategories ? 3 : 0,
    maxScore: 3,
    met: hasMultipleCategories,
  });
  if (!hasMultipleCategories && categories.length === 1) {
    suggestions.push({
      message:
        lang === 'sv'
          ? 'Lägg till minst en till kategori'
          : 'Add at least one more category',
      potentialPoints: 3,
      priority: 'low',
    });
  }

  // isBasedOn or dependsOn specified: 2p
  const hasDependencies = !!data.isBasedOn || !!data.dependsOn;
  items.push({
    name: 'dependencies',
    score: hasDependencies ? 2 : 0,
    maxScore: 2,
    met: hasDependencies,
  });

  return { items, suggestions };
}
