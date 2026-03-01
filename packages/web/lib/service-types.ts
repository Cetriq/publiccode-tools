import { ServiceType, PricingModel } from '@/types/organization';

// Swedish labels for service types
export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  support: 'Support & underhåll',
  hosting: 'Driftad hosting',
  development: 'Utveckling',
  training: 'Utbildning',
  consulting: 'Rådgivning',
  integration: 'Systemintegration',
  migration: 'Migrering',
};

// Swedish descriptions for service types
export const SERVICE_TYPE_DESCRIPTIONS: Record<ServiceType, string> = {
  support: 'Teknisk support, buggfixar och löpande underhåll',
  hosting: 'Driftad installation med övervakning och uppdateringar',
  development: 'Anpassningar, nya funktioner och vidareutveckling',
  training: 'Utbildning för användare och administratörer',
  consulting: 'Strategisk rådgivning och behovsanalys',
  integration: 'Integration med befintliga system och API:er',
  migration: 'Hjälp med att migrera från andra system',
};

// Swedish labels for pricing models
export const PRICING_MODEL_LABELS: Record<PricingModel, string> = {
  hourly: 'Timpris',
  monthly: 'Månadsavgift',
  yearly: 'Årsavgift',
  project: 'Projektpris',
  custom: 'Offert',
};

// Icons for service types (Heroicon names)
export const SERVICE_TYPE_ICONS: Record<ServiceType, string> = {
  support: 'lifebuoy',
  hosting: 'server',
  development: 'code-bracket',
  training: 'academic-cap',
  consulting: 'light-bulb',
  integration: 'puzzle-piece',
  migration: 'arrow-path',
};

// Price indicator labels
export const PRICE_INDICATOR_LABELS = {
  budget: 'Budget',
  'mid-range': 'Medel',
  premium: 'Premium',
};

// Employee count labels
export const EMPLOYEE_COUNT_LABELS = {
  '1-10': '1-10 anställda',
  '11-50': '11-50 anställda',
  '51-200': '51-200 anställda',
  '201-500': '201-500 anställda',
  '500+': '500+ anställda',
};

// Experience level labels
export const EXPERIENCE_LEVEL_LABELS = {
  beginner: 'Grundläggande',
  intermediate: 'Erfaren',
  expert: 'Expert',
};
