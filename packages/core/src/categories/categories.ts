/**
 * Category data with Swedish and English translations
 * Based on data/categories.json
 */

import type { Category } from '../types/publiccode.js';
import type { CategoryInfo } from '../types/categories.js';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'ACCOUNTING',
    en: { name: 'Accounting', description: 'Software for financial accounting and bookkeeping' },
    sv: { name: 'Bokföring', description: 'System för ekonomisk redovisning och bokföring' },
    disFase1: false,
  },
  {
    id: 'AGRI_ENVIRONMENT',
    en: { name: 'Agriculture & Environment', description: 'Agriculture and environmental management software' },
    sv: { name: 'Jordbruk & Miljö', description: 'Programvara för jordbruk och miljöförvaltning' },
    disFase1: false,
  },
  {
    id: 'ARCHIVING',
    en: { name: 'Archiving', description: 'Document and data archiving solutions' },
    sv: { name: 'Arkivering', description: 'Lösningar för dokument- och dataarkivering' },
    disFase1: false,
  },
  {
    id: 'CASE_MANAGEMENT',
    en: { name: 'Case Management', description: 'Systems for managing cases and customer interactions' },
    sv: { name: 'Ärendehantering', description: 'System för hantering av ärenden och kundinteraktioner' },
    disFase1: true,
  },
  {
    id: 'CIVIC_ENGAGEMENT',
    en: { name: 'Civic Engagement', description: 'Tools for citizen participation and engagement' },
    sv: { name: 'Medborgarengagemang', description: 'Verktyg för medborgardeltagande och engagemang' },
    disFase1: true,
  },
  {
    id: 'COLLABORATION',
    en: { name: 'Collaboration', description: 'Team collaboration and communication tools' },
    sv: { name: 'Samarbete', description: 'Verktyg för teamsamarbete och kommunikation' },
    disFase1: false,
  },
  {
    id: 'COMMUNICATIONS',
    en: { name: 'Communications', description: 'Communication and messaging platforms' },
    sv: { name: 'Kommunikation', description: 'Kommunikations- och meddelandeplattformar' },
    disFase1: false,
  },
  {
    id: 'CONTENT_MANAGEMENT',
    en: { name: 'Content Management', description: 'CMS and content management systems' },
    sv: { name: 'Innehållshantering', description: 'CMS och innehållshanteringssystem' },
    disFase1: false,
  },
  {
    id: 'DATA_ANALYTICS',
    en: { name: 'Data Analytics', description: 'Data analysis and visualization tools' },
    sv: { name: 'Dataanalys', description: 'Verktyg för dataanalys och visualisering' },
    disFase1: true,
  },
  {
    id: 'DATA_COLLECTION',
    en: { name: 'Data Collection', description: 'Data collection and survey tools' },
    sv: { name: 'Datainsamling', description: 'Verktyg för datainsamling och enkäter' },
    disFase1: false,
  },
  {
    id: 'DOCUMENT_MANAGEMENT',
    en: { name: 'Document Management', description: 'Document management and collaboration' },
    sv: { name: 'Dokumenthantering', description: 'Dokumenthantering och samarbete' },
    disFase1: true,
  },
  {
    id: 'E_COMMERCE',
    en: { name: 'E-Commerce', description: 'Online commerce and payment solutions' },
    sv: { name: 'E-handel', description: 'Lösningar för onlinehandel och betalning' },
    disFase1: false,
  },
  {
    id: 'E_SIGNATURE',
    en: { name: 'E-Signature', description: 'Electronic signature solutions' },
    sv: { name: 'E-signering', description: 'Lösningar för elektronisk signering' },
    disFase1: false,
  },
  {
    id: 'EDUCATION',
    en: { name: 'Education', description: 'Educational software and e-learning' },
    sv: { name: 'Utbildning', description: 'Utbildningsprogramvara och e-lärande' },
    disFase1: false,
  },
  {
    id: 'EMAIL_MANAGEMENT',
    en: { name: 'Email Management', description: 'Email management and automation' },
    sv: { name: 'E-posthantering', description: 'E-posthantering och automatisering' },
    disFase1: false,
  },
  {
    id: 'EVENT_MANAGEMENT',
    en: { name: 'Event Management', description: 'Event planning and management' },
    sv: { name: 'Eventhantering', description: 'Planering och hantering av evenemang' },
    disFase1: false,
  },
  {
    id: 'FACILITY_MANAGEMENT',
    en: { name: 'Facility Management', description: 'Building and facility management' },
    sv: { name: 'Fastighetsförvaltning', description: 'Byggnads- och fastighetsförvaltning' },
    disFase1: false,
  },
  {
    id: 'FINANCIAL_REPORTING',
    en: { name: 'Financial Reporting', description: 'Financial reporting and analysis' },
    sv: { name: 'Finansiell rapportering', description: 'Finansiell rapportering och analys' },
    disFase1: false,
  },
  {
    id: 'GEOGRAPHIC_INFORMATION',
    en: { name: 'Geographic Information Systems', description: 'GIS and mapping solutions' },
    sv: { name: 'Geografiska informationssystem', description: 'GIS- och kartlösningar' },
    disFase1: false,
  },
  {
    id: 'GOVERNMENT_WEBSITES',
    en: { name: 'Government Websites', description: 'Public sector website solutions' },
    sv: { name: 'Myndighetswebb', description: 'Webblösningar för offentlig sektor' },
    disFase1: false,
  },
  {
    id: 'HEALTHCARE',
    en: { name: 'Healthcare', description: 'Healthcare and medical systems' },
    sv: { name: 'Hälso- och sjukvård', description: 'Hälso- och sjukvårdssystem' },
    disFase1: false,
  },
  {
    id: 'HELPDESK',
    en: { name: 'Helpdesk', description: 'Support ticket and helpdesk systems' },
    sv: { name: 'Helpdesk', description: 'Supportsystem och ärendehantering' },
    disFase1: false,
  },
  {
    id: 'HR',
    en: { name: 'Human Resources', description: 'HR management and recruitment' },
    sv: { name: 'Personal', description: 'Personaladministration och rekrytering' },
    disFase1: false,
  },
  {
    id: 'IDENTITY_MANAGEMENT',
    en: { name: 'Identity Management', description: 'IAM and authentication solutions' },
    sv: { name: 'Identitetshantering', description: 'IAM- och autentiseringslösningar' },
    disFase1: true,
  },
  {
    id: 'IT_ASSET_MANAGEMENT',
    en: { name: 'IT Asset Management', description: 'IT asset and inventory management' },
    sv: { name: 'IT-tillgångshantering', description: 'Hantering av IT-tillgångar och inventarier' },
    disFase1: false,
  },
  {
    id: 'IT_DEVELOPMENT',
    en: { name: 'IT Development', description: 'Software development tools' },
    sv: { name: 'IT-utveckling', description: 'Verktyg för programvaruutveckling' },
    disFase1: false,
  },
  {
    id: 'IT_SECURITY',
    en: { name: 'IT Security', description: 'Cybersecurity and security tools' },
    sv: { name: 'IT-säkerhet', description: 'Cybersäkerhet och säkerhetsverktyg' },
    disFase1: false,
  },
  {
    id: 'IT_SERVICE_MANAGEMENT',
    en: { name: 'IT Service Management', description: 'ITSM and service desk solutions' },
    sv: { name: 'IT-tjänstehantering', description: 'ITSM och servicedesklösningar' },
    disFase1: false,
  },
  {
    id: 'KNOWLEDGE_MANAGEMENT',
    en: { name: 'Knowledge Management', description: 'Knowledge bases and wikis' },
    sv: { name: 'Kunskapshantering', description: 'Kunskapsbaser och wikis' },
    disFase1: false,
  },
  {
    id: 'LEARNING_MANAGEMENT',
    en: { name: 'Learning Management', description: 'LMS and training platforms' },
    sv: { name: 'Lärandehantering', description: 'LMS och utbildningsplattformar' },
    disFase1: false,
  },
  {
    id: 'LEGAL_DOCUMENT_MANAGEMENT',
    en: { name: 'Legal Document Management', description: 'Legal document management' },
    sv: { name: 'Juridisk dokumenthantering', description: 'Hantering av juridiska dokument' },
    disFase1: false,
  },
  {
    id: 'LOCAL_GOVERNMENT',
    en: { name: 'Local Government', description: 'Municipal government solutions' },
    sv: { name: 'Kommunal förvaltning', description: 'Lösningar för kommunal förvaltning' },
    disFase1: true,
  },
  {
    id: 'MARKETING',
    en: { name: 'Marketing', description: 'Marketing automation and CRM' },
    sv: { name: 'Marknadsföring', description: 'Marknadsföringsautomation och CRM' },
    disFase1: false,
  },
  {
    id: 'MOBILE_APPS',
    en: { name: 'Mobile Apps', description: 'Mobile application development' },
    sv: { name: 'Mobilappar', description: 'Utveckling av mobilapplikationer' },
    disFase1: false,
  },
  {
    id: 'OFFICE',
    en: { name: 'Office Productivity', description: 'Office and productivity suites' },
    sv: { name: 'Kontorsproduktivitet', description: 'Kontors- och produktivitetssviter' },
    disFase1: false,
  },
  {
    id: 'OPEN_DATA',
    en: { name: 'Open Data', description: 'Open data portals and catalogs' },
    sv: { name: 'Öppna data', description: 'Portaler och kataloger för öppna data' },
    disFase1: false,
  },
  {
    id: 'PAYMENTS',
    en: { name: 'Payments', description: 'Payment processing solutions' },
    sv: { name: 'Betalningar', description: 'Lösningar för betalningshantering' },
    disFase1: false,
  },
  {
    id: 'PERMITS',
    en: { name: 'Permits & Licensing', description: 'Permit and license management' },
    sv: { name: 'Tillstånd & Licenser', description: 'Hantering av tillstånd och licenser' },
    disFase1: false,
  },
  {
    id: 'POLICY_AUTHORING',
    en: { name: 'Policy Authoring', description: 'Policy and regulation authoring' },
    sv: { name: 'Policyförfattande', description: 'Framtagning av policyer och regelverk' },
    disFase1: false,
  },
  {
    id: 'PROCUREMENT',
    en: { name: 'Procurement', description: 'Procurement and purchasing' },
    sv: { name: 'Upphandling', description: 'Upphandling och inköp' },
    disFase1: false,
  },
  {
    id: 'PROJECT_MANAGEMENT',
    en: { name: 'Project Management', description: 'Project and task management' },
    sv: { name: 'Projekthantering', description: 'Projekt- och uppgiftshantering' },
    disFase1: false,
  },
  {
    id: 'PUBLIC_PARTICIPATION',
    en: { name: 'Public Participation', description: 'Public consultation and participation' },
    sv: { name: 'Medborgardeltagande', description: 'Samråd och medborgardeltagande' },
    disFase1: true,
  },
  {
    id: 'RECORDS_MANAGEMENT',
    en: { name: 'Records Management', description: 'Records and document management' },
    sv: { name: 'Diarieföring', description: 'Hantering av dokument och arkiv' },
    disFase1: false,
  },
  {
    id: 'REPORTING_ISSUES',
    en: { name: 'Reporting Issues', description: 'Issue reporting and tracking' },
    sv: { name: 'Felanmälan', description: 'Felanmälan och ärendespårning' },
    disFase1: true,
  },
  {
    id: 'SOCIAL_MEDIA_MANAGEMENT',
    en: { name: 'Social Media Management', description: 'Social media management tools' },
    sv: { name: 'Sociala medier', description: 'Verktyg för hantering av sociala medier' },
    disFase1: false,
  },
  {
    id: 'SOCIAL_SERVICES',
    en: { name: 'Social Services', description: 'Social services and welfare' },
    sv: { name: 'Socialtjänst', description: 'Socialtjänst och välfärd' },
    disFase1: false,
  },
  {
    id: 'TRANSPORTATION',
    en: { name: 'Transportation', description: 'Transportation and logistics' },
    sv: { name: 'Transport', description: 'Transport och logistik' },
    disFase1: false,
  },
  {
    id: 'VISITOR_MANAGEMENT',
    en: { name: 'Visitor Management', description: 'Visitor registration and management' },
    sv: { name: 'Besökshantering', description: 'Besöksregistrering och -hantering' },
    disFase1: false,
  },
  {
    id: 'VOTING',
    en: { name: 'Voting', description: 'Voting and election systems' },
    sv: { name: 'Röstning', description: 'Röstnings- och valsystem' },
    disFase1: false,
  },
  {
    id: 'WASTE_MANAGEMENT',
    en: { name: 'Waste Management', description: 'Waste and recycling management' },
    sv: { name: 'Avfallshantering', description: 'Avfalls- och återvinningshantering' },
    disFase1: false,
  },
  {
    id: 'WEBSITE_MANAGEMENT',
    en: { name: 'Website Management', description: 'Website and web content management' },
    sv: { name: 'Webbhantering', description: 'Webb- och innehållshantering' },
    disFase1: false,
  },
  {
    id: 'WORKFLOW_MANAGEMENT',
    en: { name: 'Workflow Management', description: 'Workflow and process automation' },
    sv: { name: 'Arbetsflöden', description: 'Arbetsflödes- och processautomation' },
    disFase1: true,
  },
];

/**
 * Get all categories
 */
export function getCategories(lang: 'sv' | 'en' = 'sv'): CategoryInfo[] {
  return CATEGORIES;
}

/**
 * Search categories by query
 */
export function searchCategories(
  query: string,
  lang: 'sv' | 'en' = 'sv'
): CategoryInfo[] {
  const lowerQuery = query.toLowerCase();
  return CATEGORIES.filter((cat) => {
    const translation = cat[lang];
    return (
      cat.id.toLowerCase().includes(lowerQuery) ||
      translation.name.toLowerCase().includes(lowerQuery) ||
      translation.description.toLowerCase().includes(lowerQuery)
    );
  });
}

/**
 * Get category translation
 */
export function getCategoryTranslation(
  categoryId: Category,
  lang: 'sv' | 'en' = 'sv'
): CategoryInfo | undefined {
  return CATEGORIES.find((cat) => cat.id === categoryId);
}

/**
 * Get DIS Phase 1 categories
 */
export function getDISFase1Categories(): CategoryInfo[] {
  return CATEGORIES.filter((cat) => cat.disFase1);
}
