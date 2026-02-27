import { describe, it, expect } from 'vitest';
import { validate } from '../src/validator/validator';

const minimalValidYaml = `
publiccodeYmlVersion: "0.4"
name: Test Project
url: "https://github.com/test/project"
platforms:
  - web
categories:
  - CASE_MANAGEMENT
developmentStatus: stable
softwareType: standalone/web
description:
  sv:
    shortDescription: En kort beskrivning av projektet
legal:
  license: MIT
  repoOwner: Test Organisation
`;

const fullValidYaml = `
publiccodeYmlVersion: "0.4"
name: Fixa Min Gata
url: "https://github.com/sundsvall/fixa-min-gata"
softwareVersion: "2.1.0"
releaseDate: "2024-01-15"
platforms:
  - web
  - ios
  - android
categories:
  - CIVIC_ENGAGEMENT
  - REPORTING_ISSUES
developmentStatus: stable
softwareType: standalone/web
description:
  sv:
    shortDescription: Felanmälningsapp för kommunala vägar
    longDescription: |
      Fixa Min Gata är en medborgarapp som gör det enkelt att rapportera
      problem i det offentliga rummet. Medborgare kan fotografera och
      rapportera potthål, trasig belysning, klotter och andra problem.
    screenshots:
      - img/screenshot-1.png
  en:
    shortDescription: Citizen reporting app for municipal roads
legal:
  license: EUPL-1.2
  repoOwner: Sundsvalls kommun
maintenance:
  type: internal
  contacts:
    - name: Anna Andersson
      email: anna@sundsvall.se
localisation:
  localisationReady: true
  availableLanguages:
    - sv
    - en
`;

describe('validate', () => {
  describe('valid YAML', () => {
    it('should validate minimal valid publiccode.yml', () => {
      const result = validate(minimalValidYaml);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate full valid publiccode.yml', () => {
      const result = validate(fullValidYaml);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return warnings for missing optional fields', () => {
      const result = validate(minimalValidYaml);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some((w) => w.path === 'maintenance')).toBe(true);
    });

    it('should not warn about Swedish description when present', () => {
      const result = validate(minimalValidYaml);
      expect(result.warnings.some((w) => w.path === 'description.sv')).toBe(
        false
      );
    });
  });

  describe('invalid YAML', () => {
    it('should reject missing required fields', () => {
      const yaml = `
publiccodeYmlVersion: "0.4"
name: Test
`;
      const result = validate(yaml);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should reject invalid YAML syntax', () => {
      const yaml = `
publiccodeYmlVersion: "0.4"
name: Test
  invalid: indentation
`;
      const result = validate(yaml);
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toContain('YAML');
    });

    it('should reject invalid category', () => {
      const yaml = `
publiccodeYmlVersion: "0.4"
name: Test
url: "https://github.com/test/project"
platforms:
  - web
categories:
  - INVALID_CATEGORY
developmentStatus: stable
softwareType: standalone/web
description:
  sv:
    shortDescription: Test
legal:
  license: MIT
  repoOwner: Test
`;
      const result = validate(yaml);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('kategori'))).toBe(
        true
      );
    });

    it('should reject invalid platform', () => {
      const yaml = `
publiccodeYmlVersion: "0.4"
name: Test
url: "https://github.com/test/project"
platforms:
  - invalid_platform
categories:
  - CASE_MANAGEMENT
developmentStatus: stable
softwareType: standalone/web
description:
  sv:
    shortDescription: Test
legal:
  license: MIT
  repoOwner: Test
`;
      const result = validate(yaml);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('plattform'))).toBe(
        true
      );
    });

    it('should reject invalid URL format', () => {
      const yaml = `
publiccodeYmlVersion: "0.4"
name: Test
url: "not-a-valid-url"
platforms:
  - web
categories:
  - CASE_MANAGEMENT
developmentStatus: stable
softwareType: standalone/web
description:
  sv:
    shortDescription: Test
legal:
  license: MIT
  repoOwner: Test
`;
      const result = validate(yaml);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('URL'))).toBe(true);
    });

    it('should reject invalid developmentStatus', () => {
      const yaml = `
publiccodeYmlVersion: "0.4"
name: Test
url: "https://github.com/test/project"
platforms:
  - web
categories:
  - CASE_MANAGEMENT
developmentStatus: invalid_status
softwareType: standalone/web
description:
  sv:
    shortDescription: Test
legal:
  license: MIT
  repoOwner: Test
`;
      const result = validate(yaml);
      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.message.includes('utvecklingsstatus'))
      ).toBe(true);
    });

    it('should reject invalid softwareType', () => {
      const yaml = `
publiccodeYmlVersion: "0.4"
name: Test
url: "https://github.com/test/project"
platforms:
  - web
categories:
  - CASE_MANAGEMENT
developmentStatus: stable
softwareType: invalid/type
description:
  sv:
    shortDescription: Test
legal:
  license: MIT
  repoOwner: Test
`;
      const result = validate(yaml);
      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.message.includes('programvarutyp'))
      ).toBe(true);
    });
  });

  describe('language support', () => {
    it('should return Swedish error messages by default', () => {
      const yaml = `
publiccodeYmlVersion: "0.4"
name: Test
`;
      const result = validate(yaml);
      expect(result.errors[0].message).toContain('saknas');
    });

    it('should return English error messages when specified', () => {
      const yaml = `
publiccodeYmlVersion: "0.4"
name: Test
`;
      const result = validate(yaml, { lang: 'en' });
      expect(result.errors[0].message).toContain('missing');
    });
  });

  describe('version support', () => {
    it('should accept version 0.4', () => {
      const yaml = minimalValidYaml.replace('0.4', '0.4');
      const result = validate(yaml);
      expect(result.valid).toBe(true);
    });

    it('should accept version 0.3', () => {
      const yaml = minimalValidYaml.replace('0.4', '0.3');
      const result = validate(yaml);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid version', () => {
      const yaml = minimalValidYaml.replace('0.4', '0.2');
      const result = validate(yaml);
      expect(result.valid).toBe(false);
    });
  });
});
