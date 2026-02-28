/**
 * DIS-Readiness Score calculator
 */
import type { PublicCode } from '../types/publiccode.js';
import type { ScoreResult } from '../types/score.js';
import { type Language } from './rules.js';
/**
 * Calculate DIS-Readiness Score for a PublicCode object
 */
export declare function score(publiccode: PublicCode, options?: {
    lang?: Language;
}): ScoreResult;
/**
 * Calculate DIS-Readiness Score from YAML string
 */
export declare function scoreYaml(yaml: string, options?: {
    lang?: Language;
}): ScoreResult;
/**
 * Generate a badge URL for the score
 */
export declare function getBadgeUrl(totalScore: number): string;
//# sourceMappingURL=scorer.d.ts.map