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
export declare const DIS_FASE1_CATEGORIES: Category[];
//# sourceMappingURL=categories.d.ts.map