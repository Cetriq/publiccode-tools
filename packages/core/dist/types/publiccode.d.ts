/**
 * publiccode.yml TypeScript types
 * Based on https://yml.publiccode.tools/schema.core.html
 */
import type { XSamhallskodexProfile } from './x-samhallskodex.js';
export interface PublicCode {
    publiccodeYmlVersion: '0.4' | '0.3';
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
    'x-dis-readinessScore'?: number;
    'x-samhallskodex'?: XSamhallskodexProfile;
}
export type Platform = 'web' | 'windows' | 'mac' | 'linux' | 'ios' | 'android';
export type DevelopmentStatus = 'concept' | 'development' | 'beta' | 'stable' | 'obsolete';
export type SoftwareType = 'standalone/mobile' | 'standalone/iot' | 'standalone/desktop' | 'standalone/web' | 'standalone/backend' | 'standalone/other' | 'addon' | 'library' | 'configurationFiles';
export type Category = 'accounting' | 'agile-project-management' | 'applicant-tracking' | 'application-development' | 'appointment-scheduling' | 'backup' | 'billing-and-invoicing' | 'blog' | 'budgeting' | 'business-intelligence' | 'business-process-management' | 'cad' | 'call-center-management' | 'case-management' | 'civic-engagement' | 'cloud-management' | 'collaboration' | 'communications' | 'compliance-management' | 'contact-management' | 'content-management' | 'crm' | 'customer-service-and-support' | 'data-analytics' | 'data-collection' | 'data-visualization' | 'design' | 'design-system' | 'digital-asset-management' | 'digital-citizenship' | 'document-management' | 'donor-management' | 'e-commerce' | 'e-signature' | 'educational-content' | 'email-management' | 'email-marketing' | 'employee-management' | 'enterprise-project-management' | 'enterprise-social-networking' | 'erp' | 'event-management' | 'facility-management' | 'feedback-and-reviews-management' | 'financial-reporting' | 'fleet-management' | 'fundraising' | 'gamification' | 'geographic-information-systems' | 'government-websites' | 'grant-management' | 'graphic-design' | 'healthcare' | 'help-desk' | 'hr' | 'ide' | 'identity-management' | 'instant-messaging' | 'integrated-library-system' | 'inventory-management' | 'it-asset-management' | 'it-development' | 'it-management' | 'it-security' | 'it-service-management' | 'knowledge-management' | 'learning-management-system' | 'local-government' | 'marketing' | 'mind-mapping' | 'mobile-marketing' | 'mobile-payment' | 'network-management' | 'office' | 'online-booking' | 'online-community' | 'payment-gateway' | 'payroll' | 'predictive-analysis' | 'procurement' | 'productivity-suite' | 'project-collaboration' | 'project-management' | 'property-management' | 'public-participation' | 'real-estate-management' | 'regulations-and-directives' | 'remote-support' | 'reporting-issues' | 'resource-management' | 'sales-management' | 'seo' | 'service-desk' | 'social-media-management' | 'social-services' | 'survey' | 'talent-management' | 'task-management' | 'taxes-management' | 'test-management' | 'time-management' | 'time-tracking' | 'translation' | 'transportation' | 'video-conferencing' | 'video-editing' | 'visitor-management' | 'voip' | 'voting' | 'warehouse-management' | 'waste-management' | 'web-collaboration' | 'web-conferencing' | 'website-builder' | 'website-management' | 'whistleblowing' | 'workflow-management';
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
//# sourceMappingURL=publiccode.d.ts.map