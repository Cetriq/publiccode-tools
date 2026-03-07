/**
 * x-samhallskodex profile validator
 * Validates the profile extension separately from the main publiccode.yml
 */
import type { Language } from './errors.js';
export interface ProfileValidationError {
    path: string;
    message: string;
}
export interface ProfileValidationWarning {
    path: string;
    message: string;
    suggestion?: string;
}
export interface ProfileValidationResult {
    valid: boolean;
    errors: ProfileValidationError[];
    warnings: ProfileValidationWarning[];
}
/**
 * Validate x-samhallskodex profile data
 */
export declare function validateProfile(data: unknown, options?: {
    lang?: Language;
}): ProfileValidationResult;
/**
 * Check if profile data has required base fields
 */
export declare function hasRequiredProfileFields(data: unknown): boolean;
//# sourceMappingURL=profile-validator.d.ts.map