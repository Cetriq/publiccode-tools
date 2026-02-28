/**
 * Category data with Swedish and English translations
 * Based on publiccode.yml standard v0.5.0 categories
 * https://yml.publiccode.tools/categories-list.html
 */
import type { Category } from '../types/publiccode.js';
import type { CategoryInfo } from '../types/categories.js';
export declare const CATEGORIES: CategoryInfo[];
/**
 * Get all categories
 */
export declare function getCategories(lang?: 'sv' | 'en'): CategoryInfo[];
/**
 * Search categories by query
 */
export declare function searchCategories(query: string, lang?: 'sv' | 'en'): CategoryInfo[];
/**
 * Get category translation
 */
export declare function getCategoryTranslation(categoryId: Category, lang?: 'sv' | 'en'): CategoryInfo | undefined;
/**
 * Get DIS Phase 1 categories
 */
export declare function getDISFase1Categories(): CategoryInfo[];
//# sourceMappingURL=categories.d.ts.map