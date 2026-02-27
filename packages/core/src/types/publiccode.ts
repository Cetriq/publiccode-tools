/**
 * publiccode.yml TypeScript types
 * Based on https://yml.publiccode.tools/schema.core.html
 */

export interface PublicCode {
  publiccodeYmlVersion: '0.4' | '0.3';

  // Required fields
  name: string;
  url: string;
  softwareVersion?: string;
  releaseDate?: string;
  platforms: Platform[];
  categories: Category[];
  developmentStatus: DevelopmentStatus;
  softwareType: SoftwareType;
  description: LocalizedDescription;
  legal: Legal;

  // Optional fields
  applicationSuite?: string;
  landingURL?: string;
  logo?: string;
  monochromeLogo?: string;
  isBasedOn?: string | string[];
  inputTypes?: string[];
  outputTypes?: string[];
  localisation?: Localisation;
  maintenance?: Maintenance;
  dependsOn?: Dependencies;

  // DIS-extension (unofficial)
  'x-dis-readinessScore'?: number;
}

export type Platform = 'web' | 'windows' | 'mac' | 'linux' | 'ios' | 'android';

export type DevelopmentStatus =
  | 'concept'
  | 'development'
  | 'beta'
  | 'stable'
  | 'obsolete';

export type SoftwareType =
  | 'standalone/mobile'
  | 'standalone/iot'
  | 'standalone/desktop'
  | 'standalone/web'
  | 'standalone/backend'
  | 'standalone/other'
  | 'addon'
  | 'library'
  | 'configurationFiles';

export type Category =
  | 'ACCOUNTING'
  | 'AGRI_ENVIRONMENT'
  | 'ARCHIVING'
  | 'CASE_MANAGEMENT'
  | 'CIVIC_ENGAGEMENT'
  | 'COLLABORATION'
  | 'COMMUNICATIONS'
  | 'CONTENT_MANAGEMENT'
  | 'DATA_ANALYTICS'
  | 'DATA_COLLECTION'
  | 'DOCUMENT_MANAGEMENT'
  | 'E_COMMERCE'
  | 'E_SIGNATURE'
  | 'EDUCATION'
  | 'EMAIL_MANAGEMENT'
  | 'EVENT_MANAGEMENT'
  | 'FACILITY_MANAGEMENT'
  | 'FINANCIAL_REPORTING'
  | 'GEOGRAPHIC_INFORMATION'
  | 'GOVERNMENT_WEBSITES'
  | 'HEALTHCARE'
  | 'HELPDESK'
  | 'HR'
  | 'IDENTITY_MANAGEMENT'
  | 'IT_ASSET_MANAGEMENT'
  | 'IT_DEVELOPMENT'
  | 'IT_SECURITY'
  | 'IT_SERVICE_MANAGEMENT'
  | 'KNOWLEDGE_MANAGEMENT'
  | 'LEARNING_MANAGEMENT'
  | 'LEGAL_DOCUMENT_MANAGEMENT'
  | 'LOCAL_GOVERNMENT'
  | 'MARKETING'
  | 'MOBILE_APPS'
  | 'OFFICE'
  | 'OPEN_DATA'
  | 'PAYMENTS'
  | 'PERMITS'
  | 'POLICY_AUTHORING'
  | 'PROCUREMENT'
  | 'PROJECT_MANAGEMENT'
  | 'PUBLIC_PARTICIPATION'
  | 'RECORDS_MANAGEMENT'
  | 'REPORTING_ISSUES'
  | 'SOCIAL_MEDIA_MANAGEMENT'
  | 'SOCIAL_SERVICES'
  | 'TRANSPORTATION'
  | 'VISITOR_MANAGEMENT'
  | 'VOTING'
  | 'WASTE_MANAGEMENT'
  | 'WEBSITE_MANAGEMENT'
  | 'WORKFLOW_MANAGEMENT';

export interface LocalizedDescription {
  [languageCode: string]: Description;
}

export interface Description {
  localisedName?: string;
  shortDescription: string;
  longDescription?: string;
  documentation?: string;
  apiDocumentation?: string;
  features?: string[];
  screenshots?: string[];
  videos?: string[];
  awards?: string[];
}

export interface Legal {
  license: string;
  mainCopyrightOwner?: string;
  repoOwner: string;
  authorsFile?: string;
}

export interface Maintenance {
  type: MaintenanceType;
  contractors?: Contractor[];
  contacts: Contact[];
}

export type MaintenanceType = 'internal' | 'contract' | 'community' | 'none';

export interface Contact {
  name: string;
  email?: string;
  phone?: string;
  affiliation?: string;
}

export interface Contractor {
  name: string;
  email?: string;
  website?: string;
  until: string;
}

export interface Localisation {
  localisationReady: boolean;
  availableLanguages: string[];
}

export interface Dependencies {
  open?: Dependency[];
  proprietary?: Dependency[];
  hardware?: Dependency[];
}

export interface Dependency {
  name: string;
  versionMin?: string;
  versionMax?: string;
  optional?: boolean;
}
