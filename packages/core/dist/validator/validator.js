/**
 * publiccode.yml validator using Ajv
 */
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { parse as parseYaml } from 'yaml';
import { readFileSync } from 'fs';
import { getErrorMessage } from './errors.js';
import schema from '../schema/publiccode.schema.json' with { type: 'json' };
// Create and configure Ajv instance
const ajv = new Ajv({
    allErrors: true,
    verbose: true,
    strict: false,
});
addFormats(ajv);
// Compile schema
const validateSchema = ajv.compile(schema);
/**
 * Validate a publiccode.yml string
 */
export function validate(yaml, options = {}) {
    const lang = options.lang ?? 'sv';
    // Parse YAML
    let data;
    try {
        data = parseYaml(yaml);
    }
    catch (err) {
        const error = err;
        return {
            valid: false,
            errors: [
                {
                    path: '',
                    message: getErrorMessage('INVALID_YAML', lang, {
                        error: error.message,
                    }),
                },
            ],
            warnings: [],
        };
    }
    // Validate against schema
    const valid = validateSchema(data);
    const errors = [];
    const warnings = [];
    if (!valid && validateSchema.errors) {
        for (const err of validateSchema.errors) {
            const path = err.instancePath.replace(/^\//, '').replace(/\//g, '.');
            const error = mapAjvError(err, lang);
            errors.push({
                path: path || err.params?.missingProperty || '',
                message: error,
            });
        }
    }
    // Add warnings for recommended fields
    if (valid || errors.length === 0) {
        const publiccode = data;
        warnings.push(...getWarnings(publiccode, lang));
    }
    return {
        valid: errors.length === 0,
        errors,
        warnings,
    };
}
/**
 * Validate a publiccode.yml file
 */
export async function validateFile(path, options = {}) {
    const lang = options.lang ?? 'sv';
    try {
        const content = readFileSync(path, 'utf-8');
        return validate(content, options);
    }
    catch {
        return {
            valid: false,
            errors: [
                {
                    path: '',
                    message: getErrorMessage('FILE_NOT_FOUND', lang, { path }),
                },
            ],
            warnings: [],
        };
    }
}
/**
 * Parse YAML and return typed PublicCode object
 */
export function parse(yaml) {
    return parseYaml(yaml);
}
/**
 * Map Ajv error to localized message
 */
function mapAjvError(err, lang) {
    const field = err.instancePath.replace(/^\//, '').replace(/\//g, '.') ||
        err.params?.missingProperty ||
        '';
    const params = err.params;
    switch (err.keyword) {
        case 'required':
            return getErrorMessage('MISSING_REQUIRED', lang, {
                field: params?.missingProperty || field,
            });
        case 'type':
            return getErrorMessage('INVALID_TYPE', lang, {
                field,
                expected: params?.type || 'unknown',
                actual: typeof err.data,
            });
        case 'format':
            if (params?.format === 'uri') {
                return getErrorMessage('INVALID_URL', lang, { field });
            }
            if (params?.format === 'email') {
                return getErrorMessage('INVALID_EMAIL', lang, { field });
            }
            if (params?.format === 'date') {
                return getErrorMessage('INVALID_DATE', lang, { field });
            }
            return err.message || 'Invalid format';
        case 'enum':
            if (field.includes('categories')) {
                return getErrorMessage('INVALID_CATEGORY', lang, {
                    value: String(err.data),
                });
            }
            if (field.includes('platforms')) {
                return getErrorMessage('INVALID_PLATFORM', lang, {
                    value: String(err.data),
                });
            }
            if (field === 'developmentStatus') {
                return getErrorMessage('INVALID_STATUS', lang, {
                    value: String(err.data),
                });
            }
            if (field === 'softwareType') {
                return getErrorMessage('INVALID_SOFTWARE_TYPE', lang, {
                    value: String(err.data),
                });
            }
            if (field === 'publiccodeYmlVersion') {
                return getErrorMessage('INVALID_VERSION', lang, {
                    value: String(err.data),
                });
            }
            return err.message || 'Invalid enum value';
        case 'minLength':
            return getErrorMessage('STRING_TOO_SHORT', lang, {
                field,
                min: String(params?.limit || 0),
            });
        case 'maxLength':
            return getErrorMessage('STRING_TOO_LONG', lang, {
                field,
                max: String(params?.limit || 0),
            });
        case 'minItems':
            return getErrorMessage('ARRAY_TOO_SHORT', lang, {
                field,
                min: String(params?.limit || 0),
            });
        case 'minProperties':
            if (field === 'description') {
                return getErrorMessage('MISSING_DESCRIPTION', lang);
            }
            return err.message || 'Missing properties';
        default:
            return err.message || 'Validation error';
    }
}
/**
 * Generate warnings for recommended but not required fields
 */
function getWarnings(data, lang) {
    const warnings = [];
    // Check for Swedish description
    if (!data.description?.sv) {
        warnings.push({
            path: 'description.sv',
            message: lang === 'sv'
                ? 'Lägg till en svensk beskrivning för bättre DIS-poäng'
                : 'Add a Swedish description for better DIS score',
            suggestion: lang === 'sv'
                ? 'Lägg till description.sv med shortDescription'
                : 'Add description.sv with shortDescription',
        });
    }
    // Check for maintenance
    if (!data.maintenance) {
        warnings.push({
            path: 'maintenance',
            message: lang === 'sv'
                ? 'Lägg till underhållsinformation'
                : 'Add maintenance information',
            suggestion: lang === 'sv'
                ? 'Lägg till maintenance.type och maintenance.contacts'
                : 'Add maintenance.type and maintenance.contacts',
        });
    }
    // Check for localisation
    if (!data.localisation) {
        warnings.push({
            path: 'localisation',
            message: lang === 'sv'
                ? 'Lägg till lokaliseringsinformation'
                : 'Add localisation information',
            suggestion: lang === 'sv'
                ? 'Lägg till localisation med availableLanguages'
                : 'Add localisation with availableLanguages',
        });
    }
    // Check for screenshots
    const descriptions = Object.values(data.description || {});
    const hasScreenshots = descriptions.some((d) => d.screenshots && d.screenshots.length > 0);
    if (!hasScreenshots) {
        warnings.push({
            path: 'description.*.screenshots',
            message: lang === 'sv'
                ? 'Lägg till screenshots för bättre presentation'
                : 'Add screenshots for better presentation',
        });
    }
    // Check for softwareVersion
    if (!data.softwareVersion) {
        warnings.push({
            path: 'softwareVersion',
            message: lang === 'sv' ? 'Lägg till softwareVersion' : 'Add softwareVersion',
        });
    }
    // Check for releaseDate
    if (!data.releaseDate) {
        warnings.push({
            path: 'releaseDate',
            message: lang === 'sv' ? 'Lägg till releaseDate' : 'Add releaseDate',
        });
    }
    return warnings;
}
//# sourceMappingURL=validator.js.map