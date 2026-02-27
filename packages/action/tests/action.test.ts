/**
 * Tests for GitHub Action
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import {
  validate,
  scoreYaml,
} from '@godwana/publiccode-core';

// Mock @actions/core
const mockCore = {
  getInput: vi.fn(),
  setOutput: vi.fn(),
  setFailed: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  summary: {
    addHeading: vi.fn().mockReturnThis(),
    addTable: vi.fn().mockReturnThis(),
    addRaw: vi.fn().mockReturnThis(),
    write: vi.fn().mockResolvedValue(undefined),
  },
};

vi.mock('@actions/core', () => mockCore);
vi.mock('@actions/github', () => ({}));

// Test fixtures
const validYaml = `
publiccodeYmlVersion: "0.4"
name: Test Project
url: https://github.com/test/project
platforms:
  - web
categories:
  - CASE_MANAGEMENT
developmentStatus: stable
softwareType: standalone/web
description:
  sv:
    shortDescription: Ett testprojekt
legal:
  license: MIT
  repoOwner: Test Organization
`;

const minimalYaml = `
publiccodeYmlVersion: "0.4"
name: Minimal
url: https://github.com/test/minimal
platforms:
  - web
categories:
  - COLLABORATION
developmentStatus: development
softwareType: library
description:
  en:
    shortDescription: A minimal project
legal:
  license: MIT
  repoOwner: Test
`;

const invalidYaml = `
publiccodeYmlVersion: "0.4"
name: Invalid
# Missing required fields
`;

describe('GitHub Action - Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates a correct publiccode.yml', () => {
    const result = validate(validYaml, { lang: 'sv' });

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('validates minimal publiccode.yml with warnings', () => {
    const result = validate(minimalYaml, { lang: 'sv' });

    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('fails on invalid publiccode.yml', () => {
    const result = validate(invalidYaml, { lang: 'sv' });

    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('returns Swedish error messages by default', () => {
    const result = validate(invalidYaml, { lang: 'sv' });

    // Should contain Swedish text
    const hasSwedish = result.errors.some(
      (e) => e.message.includes('saknas') || e.message.includes('krävs')
    );
    expect(hasSwedish).toBe(true);
  });

  it('returns English error messages when specified', () => {
    const result = validate(invalidYaml, { lang: 'en' });

    // Should contain English text
    const hasEnglish = result.errors.some(
      (e) => e.message.includes('missing') || e.message.includes('required')
    );
    expect(hasEnglish).toBe(true);
  });
});

describe('GitHub Action - Scoring', () => {
  it('calculates score for valid yaml', () => {
    const result = scoreYaml(validYaml, { lang: 'sv' });

    expect(result.total).toBeGreaterThan(0);
    expect(result.total).toBeLessThanOrEqual(100);
    expect(result.breakdown).toBeDefined();
  });

  it('gives higher score for DIS Fas 1 categories', () => {
    // CASE_MANAGEMENT is DIS Fas 1
    const withDIS = scoreYaml(validYaml, { lang: 'sv' });

    // COLLABORATION is not DIS Fas 1
    const withoutDIS = scoreYaml(minimalYaml, { lang: 'sv' });

    expect(withDIS.breakdown.disSpecific.score).toBeGreaterThan(
      withoutDIS.breakdown.disSpecific.score
    );
  });

  it('gives higher score for Swedish description', () => {
    const result = scoreYaml(validYaml, { lang: 'sv' });

    // validYaml has description.sv
    expect(result.breakdown.localisation.score).toBeGreaterThan(0);
  });

  it('returns suggestions for improvement', () => {
    const result = scoreYaml(minimalYaml, { lang: 'sv' });

    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(result.suggestions[0]).toHaveProperty('message');
    expect(result.suggestions[0]).toHaveProperty('potentialPoints');
  });

  it('breakdown adds up to total', () => {
    const result = scoreYaml(validYaml, { lang: 'sv' });

    const calculatedTotal =
      result.breakdown.requiredFields.score +
      result.breakdown.documentation.score +
      result.breakdown.localisation.score +
      result.breakdown.maintenance.score +
      result.breakdown.disSpecific.score;

    expect(result.total).toBe(calculatedTotal);
  });
});

describe('GitHub Action - Score Levels', () => {
  it('excellent score (80+) for complete yaml', () => {
    const completeYaml = `
publiccodeYmlVersion: "0.4"
name: Complete Project
url: https://github.com/test/complete
softwareVersion: "1.0.0"
releaseDate: "2026-02-01"
platforms:
  - web
categories:
  - CASE_MANAGEMENT
  - DATA_ANALYTICS
developmentStatus: stable
softwareType: standalone/web
description:
  sv:
    shortDescription: Ett komplett projekt
    longDescription: |
      Detta är en mycket detaljerad beskrivning av projektet som innehåller
      mer än 500 tecken för att få full poäng i dokumentationskategorin.
      Vi beskriver alla funktioner och hur systemet fungerar i detalj.
      Projektet är byggt med moderna teknologier och följer best practices.
      Det är enkelt att installera och konfigurera, och har omfattande
      dokumentation för både användare och utvecklare. Vi har även
      inkluderat exempel och tutorials för att göra det enkelt att komma igång.
    documentation: https://docs.example.com
    features:
      - Ärendehantering
      - Dataanalys
      - Rapportering
    screenshots:
      - https://example.com/screenshot1.png
    videos:
      - https://youtube.com/watch?v=abc123
legal:
  license: EUPL-1.2
  repoOwner: Swedish Municipality
maintenance:
  type: internal
  contacts:
    - name: Johan Andersson
      email: johan@kommun.se
      phone: "+46701234567"
localisation:
  availableLanguages:
    - sv
    - en
  localisationReady: true
dependsOn:
  open:
    - name: PostgreSQL
`;

    const result = scoreYaml(completeYaml, { lang: 'sv' });
    expect(result.total).toBeGreaterThanOrEqual(80);
  });

  it('low score for minimal yaml', () => {
    const result = scoreYaml(minimalYaml, { lang: 'sv' });
    expect(result.total).toBeLessThan(60);
  });
});

describe('GitHub Action - Exit Codes', () => {
  it('should pass when valid', () => {
    const result = validate(validYaml, { lang: 'sv' });
    expect(result.valid).toBe(true);
    // In real action: process.exitCode would be 0
  });

  it('should fail when invalid', () => {
    const result = validate(invalidYaml, { lang: 'sv' });
    expect(result.valid).toBe(false);
    // In real action: process.exitCode would be 1
  });

  it('should fail when score below minimum', () => {
    const result = scoreYaml(minimalYaml, { lang: 'sv' });
    const minScore = 80;

    const shouldFail = result.total < minScore;
    expect(shouldFail).toBe(true);
  });

  it('should pass when score above minimum', () => {
    const result = scoreYaml(validYaml, { lang: 'sv' });
    const minScore = 40;

    const shouldPass = result.total >= minScore;
    expect(shouldPass).toBe(true);
  });
});
