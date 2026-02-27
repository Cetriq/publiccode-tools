import { describe, it, expect } from 'vitest';
import { score, scoreYaml, getBadgeUrl } from '../src/scorer/scorer';
import type { PublicCode } from '../src/types/publiccode';

const minimalPubliccode: PublicCode = {
  publiccodeYmlVersion: '0.4',
  name: 'Test Project',
  url: 'https://github.com/test/project',
  platforms: ['web'],
  categories: ['CASE_MANAGEMENT'],
  developmentStatus: 'stable',
  softwareType: 'standalone/web',
  description: {
    sv: {
      shortDescription: 'En kort beskrivning av projektet',
    },
  },
  legal: {
    license: 'MIT',
    repoOwner: 'Test Organisation',
  },
};

const fullPubliccode: PublicCode = {
  publiccodeYmlVersion: '0.4',
  name: 'Fixa Min Gata',
  url: 'https://github.com/sundsvall/fixa-min-gata',
  softwareVersion: '2.1.0',
  releaseDate: new Date().toISOString().split('T')[0], // Today
  platforms: ['web', 'ios', 'android'],
  categories: ['CIVIC_ENGAGEMENT', 'REPORTING_ISSUES'],
  developmentStatus: 'stable',
  softwareType: 'standalone/web',
  description: {
    sv: {
      shortDescription: 'Felanmälningsapp för kommunala vägar',
      longDescription: `
        Fixa Min Gata är en medborgarapp som gör det enkelt att rapportera
        problem i det offentliga rummet. Medborgare kan fotografera och
        rapportera potthål, trasig belysning, klotter och andra problem.

        Appen har utvecklats av Sundsvalls kommun och är öppen källkod under
        EUPL-1.2 licensen. Den integrerar med Open311-standarden för att
        möjliggöra enkel integration med befintliga ärendehanteringssystem.

        Funktioner inkluderar GPS-taggning, push-notifieringar, statistik
        och mycket mer. Appen finns tillgänglig på svenska, engelska och
        finska.
      `.repeat(2), // Make it >500 chars
      documentation: 'https://docs.fixamingata.sundsvall.se',
      features: [
        'Fotorapportering med GPS',
        'Push-notiser',
        'Open311-integration',
        'Statistik',
      ],
      screenshots: ['img/screenshot-1.png', 'img/screenshot-2.png'],
      videos: ['https://youtube.com/watch?v=example'],
    },
    en: {
      shortDescription: 'Citizen reporting app for municipal roads',
    },
  },
  legal: {
    license: 'EUPL-1.2',
    repoOwner: 'Sundsvalls kommun',
  },
  maintenance: {
    type: 'internal',
    contacts: [
      {
        name: 'Anna Andersson',
        email: 'anna@sundsvall.se',
        phone: '+46701234567',
      },
    ],
  },
  localisation: {
    localisationReady: true,
    availableLanguages: ['sv', 'en', 'fi'],
  },
  isBasedOn: 'https://github.com/malmo/fix-my-street',
};

describe('score', () => {
  it('should return a score between 0 and 100', () => {
    const result = score(minimalPubliccode);
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(result.total).toBeLessThanOrEqual(100);
  });

  it('should return breakdown with all categories', () => {
    const result = score(minimalPubliccode);
    expect(result.breakdown).toHaveProperty('requiredFields');
    expect(result.breakdown).toHaveProperty('documentation');
    expect(result.breakdown).toHaveProperty('localisation');
    expect(result.breakdown).toHaveProperty('maintenance');
    expect(result.breakdown).toHaveProperty('disSpecific');
  });

  it('should give higher score for more complete data', () => {
    const minimalResult = score(minimalPubliccode);
    const fullResult = score(fullPubliccode);
    expect(fullResult.total).toBeGreaterThan(minimalResult.total);
  });

  it('should return suggestions for incomplete data', () => {
    const result = score(minimalPubliccode);
    expect(result.suggestions.length).toBeGreaterThan(0);
  });

  it('should sort suggestions by priority', () => {
    const result = score(minimalPubliccode);
    const priorities = result.suggestions.map((s) => s.priority);
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    for (let i = 1; i < priorities.length; i++) {
      expect(priorityOrder[priorities[i]]).toBeGreaterThanOrEqual(
        priorityOrder[priorities[i - 1]]
      );
    }
  });

  describe('required fields scoring', () => {
    it('should give 40 points max for required fields', () => {
      const result = score(fullPubliccode);
      expect(result.breakdown.requiredFields.maxScore).toBe(40);
    });

    it('should give points for each required field', () => {
      const result = score(fullPubliccode);
      expect(result.breakdown.requiredFields.score).toBeGreaterThan(30);
    });
  });

  describe('documentation scoring', () => {
    it('should give 20 points max for documentation', () => {
      const result = score(fullPubliccode);
      expect(result.breakdown.documentation.maxScore).toBe(20);
    });

    it('should give points for screenshots', () => {
      const withScreenshots = score(fullPubliccode);
      const withoutScreenshots = score(minimalPubliccode);
      expect(withScreenshots.breakdown.documentation.score).toBeGreaterThan(
        withoutScreenshots.breakdown.documentation.score
      );
    });
  });

  describe('localisation scoring', () => {
    it('should give 15 points max for localisation', () => {
      const result = score(fullPubliccode);
      expect(result.breakdown.localisation.maxScore).toBe(15);
    });

    it('should give 8 points for Swedish description', () => {
      const result = score(minimalPubliccode);
      const svItem = result.breakdown.localisation.items.find(
        (i) => i.name === 'description.sv'
      );
      expect(svItem?.score).toBe(8);
    });
  });

  describe('maintenance scoring', () => {
    it('should give 15 points max for maintenance', () => {
      const result = score(fullPubliccode);
      expect(result.breakdown.maintenance.maxScore).toBe(15);
    });

    it('should give points for internal maintenance type', () => {
      const result = score(fullPubliccode);
      const typeItem = result.breakdown.maintenance.items.find(
        (i) => i.name === 'maintenance.type'
      );
      expect(typeItem?.score).toBe(5);
    });
  });

  describe('DIS-specific scoring', () => {
    it('should give 10 points max for DIS-specific', () => {
      const result = score(fullPubliccode);
      expect(result.breakdown.disSpecific.maxScore).toBe(10);
    });

    it('should give bonus for DIS Phase 1 categories', () => {
      const result = score(fullPubliccode);
      const disItem = result.breakdown.disSpecific.items.find(
        (i) => i.name === 'disFase1Category'
      );
      expect(disItem?.score).toBe(5);
    });

    it('should give points for multiple categories', () => {
      const result = score(fullPubliccode);
      const multiItem = result.breakdown.disSpecific.items.find(
        (i) => i.name === 'multipleCategories'
      );
      expect(multiItem?.score).toBe(3);
    });
  });
});

describe('scoreYaml', () => {
  it('should parse YAML and calculate score', () => {
    const yaml = `
publiccodeYmlVersion: "0.4"
name: Test
url: "https://github.com/test/project"
platforms:
  - web
categories:
  - CASE_MANAGEMENT
developmentStatus: stable
softwareType: standalone/web
description:
  sv:
    shortDescription: Test beskrivning
legal:
  license: MIT
  repoOwner: Test
`;
    const result = scoreYaml(yaml);
    expect(result.total).toBeGreaterThan(0);
  });
});

describe('getBadgeUrl', () => {
  it('should return green badge for score >= 80', () => {
    const url = getBadgeUrl(85);
    expect(url).toContain('brightgreen');
  });

  it('should return yellow badge for score 40-59', () => {
    const url = getBadgeUrl(45);
    expect(url).toContain('yellow');
  });

  it('should return red badge for score < 20', () => {
    const url = getBadgeUrl(15);
    expect(url).toContain('red');
  });

  it('should include score in URL', () => {
    const url = getBadgeUrl(75);
    expect(url).toContain('75');
  });
});
