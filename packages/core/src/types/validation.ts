/**
 * Validation result types
 */

import type { ProfileValidationResult } from '../validator/profile-validator.js';

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  /** Profile validation result (if x-samhallskodex is present) */
  profileValidation?: ProfileValidationResult;
}

export interface ValidationError {
  path: string;
  message: string;
  line?: number;
  column?: number;
}

export interface ValidationWarning {
  path: string;
  message: string;
  suggestion?: string;
}
