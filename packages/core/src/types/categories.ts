/**
 * Category metadata types
 */

import type { Category } from './publiccode.js';

export interface CategoryInfo {
  id: Category;
  en: CategoryTranslation;
  sv: CategoryTranslation;
  disFase1: boolean;
}

export interface CategoryTranslation {
  name: string;
  description: string;
}

/**
 * DIS Phase 1 categories that give bonus points
 */
export const DIS_FASE1_CATEGORIES: Category[] = [
  'case-management',
  'civic-engagement',
  'data-analytics',
  'digital-citizenship',
  'document-management',
  'identity-management',
  'local-government',
  'public-participation',
  'reporting-issues',
  'workflow-management',
];
