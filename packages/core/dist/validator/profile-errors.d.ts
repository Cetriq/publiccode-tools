/**
 * Error messages for x-samhallskodex profile validation
 */
import type { Language } from './errors.js';
export interface ProfileErrorMessage {
    sv: string;
    en: string;
}
export declare const PROFILE_ERROR_MESSAGES: Record<string, ProfileErrorMessage>;
/**
 * Get localized profile error message
 */
export declare function getProfileErrorMessage(key: string, lang: Language, params?: Record<string, string>): string;
/**
 * Profile warning messages
 */
export declare const PROFILE_WARNING_MESSAGES: Record<string, ProfileErrorMessage>;
export declare function getProfileWarningMessage(key: string, lang: Language): string;
//# sourceMappingURL=profile-errors.d.ts.map