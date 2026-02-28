/**
 * publiccode.yml validator using Ajv
 */
import type { PublicCode } from '../types/publiccode.js';
import type { ValidationResult } from '../types/validation.js';
import { type Language } from './errors.js';
/**
 * Validate a publiccode.yml string
 */
export declare function validate(yaml: string, options?: {
    lang?: Language;
}): ValidationResult;
/**
 * Validate a publiccode.yml file
 */
export declare function validateFile(path: string, options?: {
    lang?: Language;
}): Promise<ValidationResult>;
/**
 * Parse YAML and return typed PublicCode object
 */
export declare function parse(yaml: string): PublicCode;
//# sourceMappingURL=validator.d.ts.map