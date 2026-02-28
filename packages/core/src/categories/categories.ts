/**
 * Category data with Swedish and English translations
 * Based on publiccode.yml standard v0.5.0 categories
 * https://yml.publiccode.tools/categories-list.html
 */

import type { Category } from '../types/publiccode.js';
import type { CategoryInfo } from '../types/categories.js';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'accounting',
    en: { name: 'Accounting', description: 'Software for financial accounting and bookkeeping' },
    sv: { name: 'Bokföring', description: 'System för ekonomisk redovisning och bokföring' },
    disFase1: false,
  },
  {
    id: 'agile-project-management',
    en: { name: 'Agile Project Management', description: 'Agile and scrum project management tools' },
    sv: { name: 'Agil projekthantering', description: 'Verktyg för agil och scrum-projekthantering' },
    disFase1: false,
  },
  {
    id: 'applicant-tracking',
    en: { name: 'Applicant Tracking', description: 'Recruitment and applicant tracking systems' },
    sv: { name: 'Ansökningshantering', description: 'System för rekrytering och ansökningshantering' },
    disFase1: false,
  },
  {
    id: 'application-development',
    en: { name: 'Application Development', description: 'Tools for application development' },
    sv: { name: 'Applikationsutveckling', description: 'Verktyg för applikationsutveckling' },
    disFase1: false,
  },
  {
    id: 'appointment-scheduling',
    en: { name: 'Appointment Scheduling', description: 'Appointment and booking systems' },
    sv: { name: 'Tidsbokning', description: 'System för tidsbokning och schemaläggning' },
    disFase1: false,
  },
  {
    id: 'backup',
    en: { name: 'Backup', description: 'Data backup and recovery solutions' },
    sv: { name: 'Säkerhetskopiering', description: 'Lösningar för säkerhetskopiering och återställning' },
    disFase1: false,
  },
  {
    id: 'billing-and-invoicing',
    en: { name: 'Billing and Invoicing', description: 'Billing and invoicing systems' },
    sv: { name: 'Fakturering', description: 'System för fakturering och betalning' },
    disFase1: false,
  },
  {
    id: 'blog',
    en: { name: 'Blog', description: 'Blogging platforms' },
    sv: { name: 'Blogg', description: 'Bloggplattformar' },
    disFase1: false,
  },
  {
    id: 'budgeting',
    en: { name: 'Budgeting', description: 'Budget planning and management' },
    sv: { name: 'Budgetering', description: 'Budgetplanering och -hantering' },
    disFase1: false,
  },
  {
    id: 'business-intelligence',
    en: { name: 'Business Intelligence', description: 'Business intelligence and analytics' },
    sv: { name: 'Business Intelligence', description: 'Affärsanalys och rapportering' },
    disFase1: false,
  },
  {
    id: 'business-process-management',
    en: { name: 'Business Process Management', description: 'BPM and process automation' },
    sv: { name: 'Processhantering', description: 'BPM och processautomation' },
    disFase1: false,
  },
  {
    id: 'cad',
    en: { name: 'CAD', description: 'Computer-aided design software' },
    sv: { name: 'CAD', description: 'Datorstödd design' },
    disFase1: false,
  },
  {
    id: 'call-center-management',
    en: { name: 'Call Center Management', description: 'Call center and contact center solutions' },
    sv: { name: 'Callcenterhantering', description: 'Lösningar för callcenter och kontaktcenter' },
    disFase1: false,
  },
  {
    id: 'case-management',
    en: { name: 'Case Management', description: 'Systems for managing cases and customer interactions' },
    sv: { name: 'Ärendehantering', description: 'System för hantering av ärenden och kundinteraktioner' },
    disFase1: true,
  },
  {
    id: 'civic-engagement',
    en: { name: 'Civic Engagement', description: 'Tools for citizen participation and engagement' },
    sv: { name: 'Medborgarengagemang', description: 'Verktyg för medborgardeltagande och engagemang' },
    disFase1: true,
  },
  {
    id: 'cloud-management',
    en: { name: 'Cloud Management', description: 'Cloud infrastructure management' },
    sv: { name: 'Molnhantering', description: 'Hantering av molninfrastruktur' },
    disFase1: false,
  },
  {
    id: 'collaboration',
    en: { name: 'Collaboration', description: 'Team collaboration and communication tools' },
    sv: { name: 'Samarbete', description: 'Verktyg för teamsamarbete och kommunikation' },
    disFase1: false,
  },
  {
    id: 'communications',
    en: { name: 'Communications', description: 'Communication and messaging platforms' },
    sv: { name: 'Kommunikation', description: 'Kommunikations- och meddelandeplattformar' },
    disFase1: false,
  },
  {
    id: 'compliance-management',
    en: { name: 'Compliance Management', description: 'Compliance and regulatory management' },
    sv: { name: 'Regelefterlevnad', description: 'Hantering av regelefterlevnad' },
    disFase1: false,
  },
  {
    id: 'contact-management',
    en: { name: 'Contact Management', description: 'Contact and address book management' },
    sv: { name: 'Kontakthantering', description: 'Hantering av kontakter och adressbok' },
    disFase1: false,
  },
  {
    id: 'content-management',
    en: { name: 'Content Management', description: 'CMS and content management systems' },
    sv: { name: 'Innehållshantering', description: 'CMS och innehållshanteringssystem' },
    disFase1: false,
  },
  {
    id: 'crm',
    en: { name: 'CRM', description: 'Customer relationship management' },
    sv: { name: 'CRM', description: 'Kundrelationshantering' },
    disFase1: false,
  },
  {
    id: 'customer-service-and-support',
    en: { name: 'Customer Service and Support', description: 'Customer support systems' },
    sv: { name: 'Kundsupport', description: 'System för kundsupport' },
    disFase1: false,
  },
  {
    id: 'data-analytics',
    en: { name: 'Data Analytics', description: 'Data analysis and visualization tools' },
    sv: { name: 'Dataanalys', description: 'Verktyg för dataanalys och visualisering' },
    disFase1: true,
  },
  {
    id: 'data-collection',
    en: { name: 'Data Collection', description: 'Data collection and survey tools' },
    sv: { name: 'Datainsamling', description: 'Verktyg för datainsamling och enkäter' },
    disFase1: false,
  },
  {
    id: 'data-visualization',
    en: { name: 'Data Visualization', description: 'Data visualization tools' },
    sv: { name: 'Datavisualisering', description: 'Verktyg för datavisualisering' },
    disFase1: false,
  },
  {
    id: 'design',
    en: { name: 'Design', description: 'Design tools and software' },
    sv: { name: 'Design', description: 'Designverktyg och programvara' },
    disFase1: false,
  },
  {
    id: 'design-system',
    en: { name: 'Design System', description: 'Design systems and component libraries' },
    sv: { name: 'Designsystem', description: 'Designsystem och komponentbibliotek' },
    disFase1: false,
  },
  {
    id: 'digital-asset-management',
    en: { name: 'Digital Asset Management', description: 'Digital asset management systems' },
    sv: { name: 'Digital tillgångshantering', description: 'System för digital tillgångshantering' },
    disFase1: false,
  },
  {
    id: 'digital-citizenship',
    en: { name: 'Digital Citizenship', description: 'Digital citizenship and e-government' },
    sv: { name: 'Digitalt medborgarskap', description: 'Digitalt medborgarskap och e-förvaltning' },
    disFase1: true,
  },
  {
    id: 'document-management',
    en: { name: 'Document Management', description: 'Document management and collaboration' },
    sv: { name: 'Dokumenthantering', description: 'Dokumenthantering och samarbete' },
    disFase1: true,
  },
  {
    id: 'donor-management',
    en: { name: 'Donor Management', description: 'Donor and fundraising management' },
    sv: { name: 'Givarhantering', description: 'Hantering av givare och insamling' },
    disFase1: false,
  },
  {
    id: 'e-commerce',
    en: { name: 'E-Commerce', description: 'Online commerce and payment solutions' },
    sv: { name: 'E-handel', description: 'Lösningar för onlinehandel och betalning' },
    disFase1: false,
  },
  {
    id: 'e-signature',
    en: { name: 'E-Signature', description: 'Electronic signature solutions' },
    sv: { name: 'E-signering', description: 'Lösningar för elektronisk signering' },
    disFase1: false,
  },
  {
    id: 'educational-content',
    en: { name: 'Educational Content', description: 'Educational content and e-learning' },
    sv: { name: 'Utbildningsinnehåll', description: 'Utbildningsinnehåll och e-lärande' },
    disFase1: false,
  },
  {
    id: 'email-management',
    en: { name: 'Email Management', description: 'Email management and automation' },
    sv: { name: 'E-posthantering', description: 'E-posthantering och automatisering' },
    disFase1: false,
  },
  {
    id: 'email-marketing',
    en: { name: 'Email Marketing', description: 'Email marketing tools' },
    sv: { name: 'E-postmarknadsföring', description: 'Verktyg för e-postmarknadsföring' },
    disFase1: false,
  },
  {
    id: 'employee-management',
    en: { name: 'Employee Management', description: 'Employee management systems' },
    sv: { name: 'Personalhantering', description: 'System för personalhantering' },
    disFase1: false,
  },
  {
    id: 'enterprise-project-management',
    en: { name: 'Enterprise Project Management', description: 'Enterprise project management' },
    sv: { name: 'Företagsprojekthantering', description: 'Projekthantering för företag' },
    disFase1: false,
  },
  {
    id: 'enterprise-social-networking',
    en: { name: 'Enterprise Social Networking', description: 'Enterprise social networks' },
    sv: { name: 'Företagssociala nätverk', description: 'Sociala nätverk för företag' },
    disFase1: false,
  },
  {
    id: 'erp',
    en: { name: 'ERP', description: 'Enterprise resource planning' },
    sv: { name: 'ERP', description: 'Affärssystem' },
    disFase1: false,
  },
  {
    id: 'event-management',
    en: { name: 'Event Management', description: 'Event planning and management' },
    sv: { name: 'Eventhantering', description: 'Planering och hantering av evenemang' },
    disFase1: false,
  },
  {
    id: 'facility-management',
    en: { name: 'Facility Management', description: 'Building and facility management' },
    sv: { name: 'Fastighetsförvaltning', description: 'Byggnads- och fastighetsförvaltning' },
    disFase1: false,
  },
  {
    id: 'feedback-and-reviews-management',
    en: { name: 'Feedback and Reviews Management', description: 'Feedback and review systems' },
    sv: { name: 'Feedback- och omdömeshantering', description: 'System för feedback och omdömen' },
    disFase1: false,
  },
  {
    id: 'financial-reporting',
    en: { name: 'Financial Reporting', description: 'Financial reporting and analysis' },
    sv: { name: 'Finansiell rapportering', description: 'Finansiell rapportering och analys' },
    disFase1: false,
  },
  {
    id: 'fleet-management',
    en: { name: 'Fleet Management', description: 'Fleet and vehicle management' },
    sv: { name: 'Fordonshantering', description: 'Hantering av fordonsflotta' },
    disFase1: false,
  },
  {
    id: 'fundraising',
    en: { name: 'Fundraising', description: 'Fundraising tools' },
    sv: { name: 'Insamling', description: 'Verktyg för insamling' },
    disFase1: false,
  },
  {
    id: 'gamification',
    en: { name: 'Gamification', description: 'Gamification tools' },
    sv: { name: 'Spelifiering', description: 'Verktyg för spelifiering' },
    disFase1: false,
  },
  {
    id: 'geographic-information-systems',
    en: { name: 'Geographic Information Systems', description: 'GIS and mapping solutions' },
    sv: { name: 'Geografiska informationssystem', description: 'GIS- och kartlösningar' },
    disFase1: false,
  },
  {
    id: 'government-websites',
    en: { name: 'Government Websites', description: 'Public sector website solutions' },
    sv: { name: 'Myndighetswebb', description: 'Webblösningar för offentlig sektor' },
    disFase1: false,
  },
  {
    id: 'grant-management',
    en: { name: 'Grant Management', description: 'Grant management systems' },
    sv: { name: 'Bidragshantering', description: 'System för bidragshantering' },
    disFase1: false,
  },
  {
    id: 'graphic-design',
    en: { name: 'Graphic Design', description: 'Graphic design tools' },
    sv: { name: 'Grafisk design', description: 'Verktyg för grafisk design' },
    disFase1: false,
  },
  {
    id: 'healthcare',
    en: { name: 'Healthcare', description: 'Healthcare and medical systems' },
    sv: { name: 'Hälso- och sjukvård', description: 'Hälso- och sjukvårdssystem' },
    disFase1: false,
  },
  {
    id: 'help-desk',
    en: { name: 'Help Desk', description: 'Support ticket and helpdesk systems' },
    sv: { name: 'Helpdesk', description: 'Supportsystem och ärendehantering' },
    disFase1: false,
  },
  {
    id: 'hr',
    en: { name: 'Human Resources', description: 'HR management and recruitment' },
    sv: { name: 'Personal', description: 'Personaladministration och rekrytering' },
    disFase1: false,
  },
  {
    id: 'ide',
    en: { name: 'IDE', description: 'Integrated development environments' },
    sv: { name: 'IDE', description: 'Integrerade utvecklingsmiljöer' },
    disFase1: false,
  },
  {
    id: 'identity-management',
    en: { name: 'Identity Management', description: 'IAM and authentication solutions' },
    sv: { name: 'Identitetshantering', description: 'IAM- och autentiseringslösningar' },
    disFase1: true,
  },
  {
    id: 'instant-messaging',
    en: { name: 'Instant Messaging', description: 'Instant messaging platforms' },
    sv: { name: 'Snabbmeddelanden', description: 'Plattformar för snabbmeddelanden' },
    disFase1: false,
  },
  {
    id: 'integrated-library-system',
    en: { name: 'Integrated Library System', description: 'Library management systems' },
    sv: { name: 'Bibliotekssystem', description: 'System för bibliotekshantering' },
    disFase1: false,
  },
  {
    id: 'inventory-management',
    en: { name: 'Inventory Management', description: 'Inventory and stock management' },
    sv: { name: 'Lagerhantering', description: 'Lager- och inventariehantering' },
    disFase1: false,
  },
  {
    id: 'it-asset-management',
    en: { name: 'IT Asset Management', description: 'IT asset and inventory management' },
    sv: { name: 'IT-tillgångshantering', description: 'Hantering av IT-tillgångar och inventarier' },
    disFase1: false,
  },
  {
    id: 'it-development',
    en: { name: 'IT Development', description: 'Software development tools' },
    sv: { name: 'IT-utveckling', description: 'Verktyg för programvaruutveckling' },
    disFase1: false,
  },
  {
    id: 'it-management',
    en: { name: 'IT Management', description: 'IT infrastructure management' },
    sv: { name: 'IT-hantering', description: 'Hantering av IT-infrastruktur' },
    disFase1: false,
  },
  {
    id: 'it-security',
    en: { name: 'IT Security', description: 'Cybersecurity and security tools' },
    sv: { name: 'IT-säkerhet', description: 'Cybersäkerhet och säkerhetsverktyg' },
    disFase1: false,
  },
  {
    id: 'it-service-management',
    en: { name: 'IT Service Management', description: 'ITSM and service desk solutions' },
    sv: { name: 'IT-tjänstehantering', description: 'ITSM och servicedesklösningar' },
    disFase1: false,
  },
  {
    id: 'knowledge-management',
    en: { name: 'Knowledge Management', description: 'Knowledge bases and wikis' },
    sv: { name: 'Kunskapshantering', description: 'Kunskapsbaser och wikis' },
    disFase1: false,
  },
  {
    id: 'learning-management-system',
    en: { name: 'Learning Management System', description: 'LMS and training platforms' },
    sv: { name: 'Lärplattform', description: 'LMS och utbildningsplattformar' },
    disFase1: false,
  },
  {
    id: 'local-government',
    en: { name: 'Local Government', description: 'Municipal government solutions' },
    sv: { name: 'Kommunal förvaltning', description: 'Lösningar för kommunal förvaltning' },
    disFase1: true,
  },
  {
    id: 'marketing',
    en: { name: 'Marketing', description: 'Marketing automation and CRM' },
    sv: { name: 'Marknadsföring', description: 'Marknadsföringsautomation och CRM' },
    disFase1: false,
  },
  {
    id: 'mind-mapping',
    en: { name: 'Mind Mapping', description: 'Mind mapping tools' },
    sv: { name: 'Mindmapping', description: 'Verktyg för mindmapping' },
    disFase1: false,
  },
  {
    id: 'mobile-marketing',
    en: { name: 'Mobile Marketing', description: 'Mobile marketing tools' },
    sv: { name: 'Mobilmarknadsföring', description: 'Verktyg för mobilmarknadsföring' },
    disFase1: false,
  },
  {
    id: 'mobile-payment',
    en: { name: 'Mobile Payment', description: 'Mobile payment solutions' },
    sv: { name: 'Mobilbetalning', description: 'Lösningar för mobilbetalning' },
    disFase1: false,
  },
  {
    id: 'network-management',
    en: { name: 'Network Management', description: 'Network management tools' },
    sv: { name: 'Nätverkshantering', description: 'Verktyg för nätverkshantering' },
    disFase1: false,
  },
  {
    id: 'office',
    en: { name: 'Office Productivity', description: 'Office and productivity suites' },
    sv: { name: 'Kontorsproduktivitet', description: 'Kontors- och produktivitetssviter' },
    disFase1: false,
  },
  {
    id: 'online-booking',
    en: { name: 'Online Booking', description: 'Online booking systems' },
    sv: { name: 'Onlinebokning', description: 'System för onlinebokning' },
    disFase1: false,
  },
  {
    id: 'online-community',
    en: { name: 'Online Community', description: 'Online community platforms' },
    sv: { name: 'Onlinegemenskap', description: 'Plattformar för onlinegemenskaper' },
    disFase1: false,
  },
  {
    id: 'payment-gateway',
    en: { name: 'Payment Gateway', description: 'Payment gateway solutions' },
    sv: { name: 'Betalningsgateway', description: 'Lösningar för betalningsgateway' },
    disFase1: false,
  },
  {
    id: 'payroll',
    en: { name: 'Payroll', description: 'Payroll management' },
    sv: { name: 'Lönehantering', description: 'Hantering av löner' },
    disFase1: false,
  },
  {
    id: 'predictive-analysis',
    en: { name: 'Predictive Analysis', description: 'Predictive analytics tools' },
    sv: { name: 'Prediktiv analys', description: 'Verktyg för prediktiv analys' },
    disFase1: false,
  },
  {
    id: 'procurement',
    en: { name: 'Procurement', description: 'Procurement and purchasing' },
    sv: { name: 'Upphandling', description: 'Upphandling och inköp' },
    disFase1: false,
  },
  {
    id: 'productivity-suite',
    en: { name: 'Productivity Suite', description: 'Productivity suites' },
    sv: { name: 'Produktivitetssvit', description: 'Produktivitetssviter' },
    disFase1: false,
  },
  {
    id: 'project-collaboration',
    en: { name: 'Project Collaboration', description: 'Project collaboration tools' },
    sv: { name: 'Projektsamarbete', description: 'Verktyg för projektsamarbete' },
    disFase1: false,
  },
  {
    id: 'project-management',
    en: { name: 'Project Management', description: 'Project and task management' },
    sv: { name: 'Projekthantering', description: 'Projekt- och uppgiftshantering' },
    disFase1: false,
  },
  {
    id: 'property-management',
    en: { name: 'Property Management', description: 'Property management systems' },
    sv: { name: 'Fastighetshantering', description: 'System för fastighetshantering' },
    disFase1: false,
  },
  {
    id: 'public-participation',
    en: { name: 'Public Participation', description: 'Public consultation and participation' },
    sv: { name: 'Medborgardeltagande', description: 'Samråd och medborgardeltagande' },
    disFase1: true,
  },
  {
    id: 'real-estate-management',
    en: { name: 'Real Estate Management', description: 'Real estate management' },
    sv: { name: 'Fastighetsförvaltning', description: 'Förvaltning av fastigheter' },
    disFase1: false,
  },
  {
    id: 'regulations-and-directives',
    en: { name: 'Regulations and Directives', description: 'Regulatory compliance tools' },
    sv: { name: 'Regelverk och direktiv', description: 'Verktyg för regelefterlevnad' },
    disFase1: false,
  },
  {
    id: 'remote-support',
    en: { name: 'Remote Support', description: 'Remote support tools' },
    sv: { name: 'Fjärrsupport', description: 'Verktyg för fjärrsupport' },
    disFase1: false,
  },
  {
    id: 'reporting-issues',
    en: { name: 'Reporting Issues', description: 'Issue reporting and tracking' },
    sv: { name: 'Felanmälan', description: 'Felanmälan och ärendespårning' },
    disFase1: true,
  },
  {
    id: 'resource-management',
    en: { name: 'Resource Management', description: 'Resource management tools' },
    sv: { name: 'Resurshantering', description: 'Verktyg för resurshantering' },
    disFase1: false,
  },
  {
    id: 'sales-management',
    en: { name: 'Sales Management', description: 'Sales management tools' },
    sv: { name: 'Försäljningshantering', description: 'Verktyg för försäljningshantering' },
    disFase1: false,
  },
  {
    id: 'seo',
    en: { name: 'SEO', description: 'Search engine optimization tools' },
    sv: { name: 'SEO', description: 'Verktyg för sökmotoroptimering' },
    disFase1: false,
  },
  {
    id: 'service-desk',
    en: { name: 'Service Desk', description: 'Service desk solutions' },
    sv: { name: 'Servicedesk', description: 'Servicedesklösningar' },
    disFase1: false,
  },
  {
    id: 'social-media-management',
    en: { name: 'Social Media Management', description: 'Social media management tools' },
    sv: { name: 'Sociala medier', description: 'Verktyg för hantering av sociala medier' },
    disFase1: false,
  },
  {
    id: 'social-services',
    en: { name: 'Social Services', description: 'Social services and welfare' },
    sv: { name: 'Socialtjänst', description: 'Socialtjänst och välfärd' },
    disFase1: false,
  },
  {
    id: 'survey',
    en: { name: 'Survey', description: 'Survey and polling tools' },
    sv: { name: 'Enkäter', description: 'Verktyg för enkäter och omröstningar' },
    disFase1: false,
  },
  {
    id: 'talent-management',
    en: { name: 'Talent Management', description: 'Talent management systems' },
    sv: { name: 'Talanghantering', description: 'System för talanghantering' },
    disFase1: false,
  },
  {
    id: 'task-management',
    en: { name: 'Task Management', description: 'Task management tools' },
    sv: { name: 'Uppgiftshantering', description: 'Verktyg för uppgiftshantering' },
    disFase1: false,
  },
  {
    id: 'taxes-management',
    en: { name: 'Taxes Management', description: 'Tax management systems' },
    sv: { name: 'Skattehantering', description: 'System för skattehantering' },
    disFase1: false,
  },
  {
    id: 'test-management',
    en: { name: 'Test Management', description: 'Test management tools' },
    sv: { name: 'Testhantering', description: 'Verktyg för testhantering' },
    disFase1: false,
  },
  {
    id: 'time-management',
    en: { name: 'Time Management', description: 'Time management tools' },
    sv: { name: 'Tidshantering', description: 'Verktyg för tidshantering' },
    disFase1: false,
  },
  {
    id: 'time-tracking',
    en: { name: 'Time Tracking', description: 'Time tracking tools' },
    sv: { name: 'Tidrapportering', description: 'Verktyg för tidrapportering' },
    disFase1: false,
  },
  {
    id: 'translation',
    en: { name: 'Translation', description: 'Translation tools' },
    sv: { name: 'Översättning', description: 'Verktyg för översättning' },
    disFase1: false,
  },
  {
    id: 'transportation',
    en: { name: 'Transportation', description: 'Transportation and logistics' },
    sv: { name: 'Transport', description: 'Transport och logistik' },
    disFase1: false,
  },
  {
    id: 'video-conferencing',
    en: { name: 'Video Conferencing', description: 'Video conferencing tools' },
    sv: { name: 'Videokonferens', description: 'Verktyg för videokonferens' },
    disFase1: false,
  },
  {
    id: 'video-editing',
    en: { name: 'Video Editing', description: 'Video editing tools' },
    sv: { name: 'Videoredigering', description: 'Verktyg för videoredigering' },
    disFase1: false,
  },
  {
    id: 'visitor-management',
    en: { name: 'Visitor Management', description: 'Visitor registration and management' },
    sv: { name: 'Besökshantering', description: 'Besöksregistrering och -hantering' },
    disFase1: false,
  },
  {
    id: 'voip',
    en: { name: 'VoIP', description: 'Voice over IP solutions' },
    sv: { name: 'VoIP', description: 'Voice over IP-lösningar' },
    disFase1: false,
  },
  {
    id: 'voting',
    en: { name: 'Voting', description: 'Voting and election systems' },
    sv: { name: 'Röstning', description: 'Röstnings- och valsystem' },
    disFase1: false,
  },
  {
    id: 'warehouse-management',
    en: { name: 'Warehouse Management', description: 'Warehouse management systems' },
    sv: { name: 'Lagerhantering', description: 'System för lagerhantering' },
    disFase1: false,
  },
  {
    id: 'waste-management',
    en: { name: 'Waste Management', description: 'Waste and recycling management' },
    sv: { name: 'Avfallshantering', description: 'Avfalls- och återvinningshantering' },
    disFase1: false,
  },
  {
    id: 'web-collaboration',
    en: { name: 'Web Collaboration', description: 'Web collaboration tools' },
    sv: { name: 'Webbsamarbete', description: 'Verktyg för webbsamarbete' },
    disFase1: false,
  },
  {
    id: 'web-conferencing',
    en: { name: 'Web Conferencing', description: 'Web conferencing tools' },
    sv: { name: 'Webbkonferens', description: 'Verktyg för webbkonferens' },
    disFase1: false,
  },
  {
    id: 'website-builder',
    en: { name: 'Website Builder', description: 'Website building tools' },
    sv: { name: 'Webbplatsbyggare', description: 'Verktyg för att bygga webbplatser' },
    disFase1: false,
  },
  {
    id: 'website-management',
    en: { name: 'Website Management', description: 'Website and web content management' },
    sv: { name: 'Webbhantering', description: 'Webb- och innehållshantering' },
    disFase1: false,
  },
  {
    id: 'whistleblowing',
    en: { name: 'Whistleblowing', description: 'Whistleblowing platforms' },
    sv: { name: 'Visselblåsning', description: 'Plattformar för visselblåsning' },
    disFase1: false,
  },
  {
    id: 'workflow-management',
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
