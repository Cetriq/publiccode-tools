/**
 * Error messages in Swedish and English
 */
export const ERROR_MESSAGES = {
    // Required field errors
    MISSING_REQUIRED: {
        sv: "Obligatoriskt fält '{field}' saknas",
        en: "Required field '{field}' is missing",
    },
    // Type errors
    INVALID_TYPE: {
        sv: "Fältet '{field}' har fel typ. Förväntad: {expected}, fick: {actual}",
        en: "Field '{field}' has wrong type. Expected: {expected}, got: {actual}",
    },
    // Format errors
    INVALID_URL: {
        sv: "Fältet '{field}' innehåller en ogiltig URL",
        en: "Field '{field}' contains an invalid URL",
    },
    INVALID_EMAIL: {
        sv: "Fältet '{field}' innehåller en ogiltig e-postadress",
        en: "Field '{field}' contains an invalid email address",
    },
    INVALID_DATE: {
        sv: "Fältet '{field}' innehåller ett ogiltigt datum (använd YYYY-MM-DD)",
        en: "Field '{field}' contains an invalid date (use YYYY-MM-DD)",
    },
    // Enum errors
    INVALID_CATEGORY: {
        sv: "'{value}' är inte en giltig kategori",
        en: "'{value}' is not a valid category",
    },
    INVALID_PLATFORM: {
        sv: "'{value}' är inte en giltig plattform",
        en: "'{value}' is not a valid platform",
    },
    INVALID_STATUS: {
        sv: "'{value}' är inte en giltig utvecklingsstatus",
        en: "'{value}' is not a valid development status",
    },
    INVALID_SOFTWARE_TYPE: {
        sv: "'{value}' är inte en giltig programvarutyp",
        en: "'{value}' is not a valid software type",
    },
    INVALID_MAINTENANCE_TYPE: {
        sv: "'{value}' är inte en giltig underhållstyp",
        en: "'{value}' is not a valid maintenance type",
    },
    INVALID_VERSION: {
        sv: "'{value}' är inte en giltig publiccode.yml-version",
        en: "'{value}' is not a valid publiccode.yml version",
    },
    // Length errors
    STRING_TOO_SHORT: {
        sv: "Fältet '{field}' är för kort (minst {min} tecken)",
        en: "Field '{field}' is too short (minimum {min} characters)",
    },
    STRING_TOO_LONG: {
        sv: "Fältet '{field}' är för långt (max {max} tecken)",
        en: "Field '{field}' is too long (maximum {max} characters)",
    },
    ARRAY_TOO_SHORT: {
        sv: "Fältet '{field}' måste ha minst {min} element",
        en: "Field '{field}' must have at least {min} items",
    },
    // Description errors
    MISSING_DESCRIPTION: {
        sv: 'Minst en beskrivning (description) krävs',
        en: 'At least one description is required',
    },
    MISSING_SHORT_DESCRIPTION: {
        sv: "Kort beskrivning (shortDescription) saknas för språk '{lang}'",
        en: "Short description (shortDescription) is missing for language '{lang}'",
    },
    // YAML errors
    INVALID_YAML: {
        sv: 'Ogiltig YAML-syntax: {error}',
        en: 'Invalid YAML syntax: {error}',
    },
    // File errors
    FILE_NOT_FOUND: {
        sv: "Filen '{path}' hittades inte",
        en: "File '{path}' not found",
    },
};
/**
 * Get localized error message
 */
export function getErrorMessage(key, lang, params = {}) {
    const messages = ERROR_MESSAGES[key];
    if (!messages) {
        return lang === 'sv' ? `Okänt fel: ${key}` : `Unknown error: ${key}`;
    }
    let message = messages[lang];
    for (const [param, value] of Object.entries(params)) {
        message = message.replace(`{${param}}`, value);
    }
    return message;
}
//# sourceMappingURL=errors.js.map