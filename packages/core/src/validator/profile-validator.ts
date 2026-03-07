/**
 * x-samhallskodex profile validator
 * Validates the profile extension separately from the main publiccode.yml
 */

import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import type { XSamhallskodexProfile } from '../types/x-samhallskodex.js';
import type { Language } from './errors.js';
import { getProfileErrorMessage, getProfileWarningMessage } from './profile-errors.js';
import profileSchema from '../schema/x-samhallskodex.schema.json' with { type: 'json' };

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

interface AjvError {
  instancePath: string;
  keyword: string;
  message?: string;
  params: Record<string, unknown>;
  data?: unknown;
}

// Create Ajv instance for profile validation
const ajv = new Ajv({
  allErrors: true,
  verbose: true,
  strict: false,
});

addFormats(ajv);

// Compile profile schema
const validateProfileSchema = ajv.compile(profileSchema);

/**
 * Validate x-samhallskodex profile data
 */
export function validateProfile(
  data: unknown,
  options: { lang?: Language } = {}
): ProfileValidationResult {
  const lang = options.lang ?? 'sv';

  if (!data) {
    return {
      valid: true, // Profile is optional
      errors: [],
      warnings: [],
    };
  }

  const errors: ProfileValidationError[] = [];
  const warnings: ProfileValidationWarning[] = [];

  // Validate against schema
  const valid = validateProfileSchema(data);

  if (!valid && validateProfileSchema.errors) {
    for (const err of validateProfileSchema.errors as AjvError[]) {
      const path = `x-samhallskodex${err.instancePath.replace(/\//g, '.')}`;
      const error = mapProfileAjvError(err, lang);
      errors.push({
        path,
        message: error,
      });
    }
  }

  // Add warnings for recommended fields
  if (errors.length === 0) {
    const profile = data as XSamhallskodexProfile;
    warnings.push(...getProfileWarnings(profile, lang));
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Map Ajv error to localized profile error message
 */
function mapProfileAjvError(err: AjvError, lang: Language): string {
  const field = err.instancePath.replace(/^\//, '').replace(/\//g, '.') ||
    (err.params?.missingProperty as string) || '';
  const params = err.params;

  switch (err.keyword) {
    case 'required':
      return getProfileErrorMessage('PROFILE_MISSING_REQUIRED', lang, {
        field: (params?.missingProperty as string) || field,
      });

    case 'type':
      if (params?.type === 'boolean') {
        return getProfileErrorMessage('PROFILE_INVALID_BOOLEAN', lang, { field });
      }
      return getProfileErrorMessage('PROFILE_INVALID_TYPE', lang, {
        field,
        expected: (params?.type as string) || 'unknown',
      });

    case 'enum':
      return mapProfileEnumError(field, String(err.data), lang);

    case 'minimum':
    case 'maximum':
      if (field.includes('Rating') || field.includes('rating') ||
          field.includes('Maturity') || field.includes('observability')) {
        return getProfileErrorMessage('PROFILE_INVALID_RATING', lang, { field });
      }
      return err.message || 'Invalid value';

    case 'minItems':
      return getProfileErrorMessage('PROFILE_ARRAY_EMPTY', lang, { field });

    default:
      return err.message || 'Profile validation error';
  }
}

/**
 * Map enum errors to specific messages based on field
 */
function mapProfileEnumError(field: string, value: string, lang: Language): string {
  // profileVersion
  if (field === 'profileVersion') {
    return getProfileErrorMessage('PROFILE_INVALID_VERSION', lang, { value });
  }

  // Architecture UI
  if (field.includes('ui.platform')) {
    return getProfileErrorMessage('PROFILE_INVALID_PLATFORM', lang, { value });
  }
  if (field.includes('ui.framework')) {
    return getProfileErrorMessage('PROFILE_INVALID_FRAMEWORK', lang, { value });
  }

  // Architecture Backend
  if (field.includes('backend.architecture')) {
    return getProfileErrorMessage('PROFILE_INVALID_BACKEND_ARCH', lang, { value });
  }
  if (field.includes('backend.style')) {
    return getProfileErrorMessage('PROFILE_INVALID_BACKEND_STYLE', lang, { value });
  }
  if (field.includes('backend.runtime')) {
    return getProfileErrorMessage('PROFILE_INVALID_RUNTIME', lang, { value });
  }

  // Deployment
  if (field.includes('deployment.hosting')) {
    return getProfileErrorMessage('PROFILE_INVALID_HOSTING', lang, { value });
  }

  // Integration
  if (field.includes('apiStyles')) {
    return getProfileErrorMessage('PROFILE_INVALID_API_STYLE', lang, { value });
  }
  if (field.includes('identity')) {
    return getProfileErrorMessage('PROFILE_INVALID_IDENTITY', lang, { value });
  }
  if (field.includes('protocols')) {
    return getProfileErrorMessage('PROFILE_INVALID_PROTOCOL', lang, { value });
  }

  // AI
  if (field.includes('useCases')) {
    return getProfileErrorMessage('PROFILE_INVALID_AI_USE_CASE', lang, { value });
  }
  if (field.includes('modelExecution.locality')) {
    return getProfileErrorMessage('PROFILE_INVALID_MODEL_LOCALITY', lang, { value });
  }

  // Quality
  if (field.includes('testCoverageLevel')) {
    return getProfileErrorMessage('PROFILE_INVALID_COVERAGE_LEVEL', lang, { value });
  }

  // Governance
  if (field.includes('opennessLevel')) {
    return getProfileErrorMessage('PROFILE_INVALID_OPENNESS', lang, { value });
  }
  if (field.includes('dataHosting.locality')) {
    return getProfileErrorMessage('PROFILE_INVALID_DATA_LOCALITY', lang, { value });
  }
  if (field.includes('auditability') || field.includes('vendorDependency') ||
      field.includes('lockInRisk') || field.includes('dataPortability')) {
    return getProfileErrorMessage('PROFILE_INVALID_LEVEL', lang, { value });
  }

  return lang === 'sv' ? `'${value}' är inte ett giltigt värde` : `'${value}' is not a valid value`;
}

/**
 * Generate warnings for recommended profile fields
 */
function getProfileWarnings(
  profile: XSamhallskodexProfile,
  lang: Language
): ProfileValidationWarning[] {
  const warnings: ProfileValidationWarning[] = [];

  // Architecture warnings
  if (!profile.architecture?.ui?.framework) {
    warnings.push({
      path: 'x-samhallskodex.architecture.ui.framework',
      message: getProfileWarningMessage('PROFILE_MISSING_FRAMEWORK', lang),
    });
  }

  if (!profile.architecture?.backend?.runtime) {
    warnings.push({
      path: 'x-samhallskodex.architecture.backend.runtime',
      message: getProfileWarningMessage('PROFILE_MISSING_RUNTIME', lang),
    });
  }

  // Integration warnings
  if (!profile.integration?.identity || profile.integration.identity.length === 0) {
    warnings.push({
      path: 'x-samhallskodex.integration.identity',
      message: getProfileWarningMessage('PROFILE_MISSING_IDENTITY', lang),
    });
  }

  // Quality warnings
  if (!profile.quality) {
    warnings.push({
      path: 'x-samhallskodex.quality',
      message: getProfileWarningMessage('PROFILE_MISSING_QUALITY', lang),
    });
  }

  // Governance warnings
  if (!profile.governance?.dataHosting) {
    warnings.push({
      path: 'x-samhallskodex.governance.dataHosting',
      message: getProfileWarningMessage('PROFILE_MISSING_DATA_HOSTING', lang),
    });
  }

  // AI-specific warnings
  if (profile.ai?.enabled) {
    if (!profile.ai.useCases || profile.ai.useCases.length === 0) {
      warnings.push({
        path: 'x-samhallskodex.ai.useCases',
        message: getProfileWarningMessage('PROFILE_AI_ENABLED_NO_USECASES', lang),
      });
    }
    if (profile.ai.humanInLoop === undefined) {
      warnings.push({
        path: 'x-samhallskodex.ai.humanInLoop',
        message: getProfileWarningMessage('PROFILE_AI_ENABLED_NO_HUMANINLOOP', lang),
      });
    }
  }

  return warnings;
}

/**
 * Check if profile data has required base fields
 */
export function hasRequiredProfileFields(data: unknown): boolean {
  if (!data || typeof data !== 'object') return false;

  const profile = data as Partial<XSamhallskodexProfile>;

  return !!(
    profile.profileVersion &&
    profile.architecture?.ui?.platform &&
    profile.architecture?.backend?.architecture &&
    profile.integration?.apiStyles?.length &&
    profile.ai?.enabled !== undefined &&
    profile.governance?.opennessLevel
  );
}
