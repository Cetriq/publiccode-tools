/**
 * x-samhallskodex profile scorer
 * Calculates a separate score (0-100%) for the profile extension
 */
import type { XSamhallskodexProfile } from '../types/x-samhallskodex.js';
import type { ProfileScoreResult } from '../types/profile-score.js';
type Language = 'sv' | 'en';
interface ScorerOptions {
    lang?: Language;
}
/**
 * Calculate profile score (0-100%)
 */
export declare function scoreProfile(profile: XSamhallskodexProfile | undefined, options?: ScorerOptions): ProfileScoreResult;
export {};
//# sourceMappingURL=profile-scorer.d.ts.map