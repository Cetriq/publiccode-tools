/**
 * DIS-Readiness Score rules
 * Based on SPEC.md scoring criteria
 */
import type { PublicCode } from '../types/publiccode.js';
import type { ScoreItem, Suggestion } from '../types/score.js';
export type Language = 'sv' | 'en';
/**
 * Required fields scoring (40 points max)
 */
export declare function scoreRequiredFields(data: PublicCode, lang: Language): {
    items: ScoreItem[];
    suggestions: Suggestion[];
};
/**
 * Documentation scoring (20 points max)
 */
export declare function scoreDocumentation(data: PublicCode, lang: Language): {
    items: ScoreItem[];
    suggestions: Suggestion[];
};
/**
 * Localisation scoring (15 points max)
 */
export declare function scoreLocalisation(data: PublicCode, lang: Language): {
    items: ScoreItem[];
    suggestions: Suggestion[];
};
/**
 * Maintenance scoring (15 points max)
 */
export declare function scoreMaintenance(data: PublicCode, lang: Language): {
    items: ScoreItem[];
    suggestions: Suggestion[];
};
/**
 * DIS-specific scoring (10 points max)
 */
export declare function scoreDISSpecific(data: PublicCode, lang: Language): {
    items: ScoreItem[];
    suggestions: Suggestion[];
};
//# sourceMappingURL=rules.d.ts.map