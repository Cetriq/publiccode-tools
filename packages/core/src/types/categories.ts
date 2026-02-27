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
  'CASE_MANAGEMENT',
  'CIVIC_ENGAGEMENT',
  'DATA_ANALYTICS',
  'DOCUMENT_MANAGEMENT',
  'IDENTITY_MANAGEMENT',
  'LOCAL_GOVERNMENT',
  'PUBLIC_PARTICIPATION',
  'REPORTING_ISSUES',
  'WORKFLOW_MANAGEMENT',
];
