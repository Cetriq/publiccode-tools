/**
 * Error messages for x-samhallskodex profile validation
 */
export const PROFILE_ERROR_MESSAGES = {
    // Required field errors
    PROFILE_MISSING_REQUIRED: {
        sv: "Obligatoriskt profile-fält '{field}' saknas",
        en: "Required profile field '{field}' is missing",
    },
    // Version errors
    PROFILE_INVALID_VERSION: {
        sv: "'{value}' är inte en giltig profileVersion",
        en: "'{value}' is not a valid profileVersion",
    },
    // Architecture errors
    PROFILE_INVALID_PLATFORM: {
        sv: "'{value}' är inte en giltig UI-plattform",
        en: "'{value}' is not a valid UI platform",
    },
    PROFILE_INVALID_FRAMEWORK: {
        sv: "'{value}' är inte ett giltigt UI-ramverk",
        en: "'{value}' is not a valid UI framework",
    },
    PROFILE_INVALID_BACKEND_ARCH: {
        sv: "'{value}' är inte en giltig backend-arkitektur",
        en: "'{value}' is not a valid backend architecture",
    },
    PROFILE_INVALID_BACKEND_STYLE: {
        sv: "'{value}' är inte en giltig applikationsstil",
        en: "'{value}' is not a valid application style",
    },
    PROFILE_INVALID_RUNTIME: {
        sv: "'{value}' är inte en giltig runtime",
        en: "'{value}' is not a valid runtime",
    },
    PROFILE_INVALID_HOSTING: {
        sv: "'{value}' är inte en giltig hosting-modell",
        en: "'{value}' is not a valid hosting model",
    },
    // Integration errors
    PROFILE_INVALID_API_STYLE: {
        sv: "'{value}' är inte en giltig API-stil",
        en: "'{value}' is not a valid API style",
    },
    PROFILE_INVALID_IDENTITY: {
        sv: "'{value}' är inte en giltig identitetsmetod",
        en: "'{value}' is not a valid identity method",
    },
    PROFILE_INVALID_PROTOCOL: {
        sv: "'{value}' är inte ett giltigt integrationsprotokoll",
        en: "'{value}' is not a valid integration protocol",
    },
    // AI errors
    PROFILE_INVALID_AI_USE_CASE: {
        sv: "'{value}' är inte ett giltigt AI-användningsfall",
        en: "'{value}' is not a valid AI use case",
    },
    PROFILE_INVALID_MODEL_LOCALITY: {
        sv: "'{value}' är inte en giltig modell-lokalitet",
        en: "'{value}' is not a valid model locality",
    },
    // Quality errors
    PROFILE_INVALID_RATING: {
        sv: "Fältet '{field}' måste vara mellan 1 och 5",
        en: "Field '{field}' must be between 1 and 5",
    },
    PROFILE_INVALID_COVERAGE_LEVEL: {
        sv: "'{value}' är inte en giltig täckningsnivå",
        en: "'{value}' is not a valid coverage level",
    },
    // Governance errors
    PROFILE_INVALID_OPENNESS: {
        sv: "'{value}' är inte en giltig öppenhetsnivå",
        en: "'{value}' is not a valid openness level",
    },
    PROFILE_INVALID_DATA_LOCALITY: {
        sv: "'{value}' är inte en giltig datalokalitet",
        en: "'{value}' is not a valid data locality",
    },
    PROFILE_INVALID_LEVEL: {
        sv: "'{value}' är inte en giltig nivå (low/medium/high)",
        en: "'{value}' is not a valid level (low/medium/high)",
    },
    // Type errors
    PROFILE_INVALID_TYPE: {
        sv: "Fältet '{field}' har fel typ. Förväntad: {expected}",
        en: "Field '{field}' has wrong type. Expected: {expected}",
    },
    PROFILE_INVALID_BOOLEAN: {
        sv: "Fältet '{field}' måste vara true eller false",
        en: "Field '{field}' must be true or false",
    },
    // Array errors
    PROFILE_ARRAY_EMPTY: {
        sv: "Fältet '{field}' måste innehålla minst ett värde",
        en: "Field '{field}' must contain at least one value",
    },
};
/**
 * Get localized profile error message
 */
export function getProfileErrorMessage(key, lang, params = {}) {
    const messages = PROFILE_ERROR_MESSAGES[key];
    if (!messages) {
        return lang === 'sv' ? `Okänt profile-fel: ${key}` : `Unknown profile error: ${key}`;
    }
    let message = messages[lang];
    for (const [param, value] of Object.entries(params)) {
        message = message.replace(`{${param}}`, value);
    }
    return message;
}
/**
 * Profile warning messages
 */
export const PROFILE_WARNING_MESSAGES = {
    PROFILE_MISSING_FRAMEWORK: {
        sv: 'Lägg till architecture.ui.framework för fullständigare profil',
        en: 'Add architecture.ui.framework for a more complete profile',
    },
    PROFILE_MISSING_RUNTIME: {
        sv: 'Lägg till architecture.backend.runtime för fullständigare profil',
        en: 'Add architecture.backend.runtime for a more complete profile',
    },
    PROFILE_MISSING_IDENTITY: {
        sv: 'Lägg till integration.identity för bättre integration-info',
        en: 'Add integration.identity for better integration info',
    },
    PROFILE_MISSING_QUALITY: {
        sv: 'Lägg till quality-sektionen för kvalitetsgradering',
        en: 'Add quality section for quality ratings',
    },
    PROFILE_MISSING_DATA_HOSTING: {
        sv: 'Lägg till governance.dataHosting för datalokalitetsinformation',
        en: 'Add governance.dataHosting for data locality information',
    },
    PROFILE_AI_ENABLED_NO_USECASES: {
        sv: 'AI är aktiverat men inga användningsfall är angivna',
        en: 'AI is enabled but no use cases are specified',
    },
    PROFILE_AI_ENABLED_NO_HUMANINLOOP: {
        sv: 'Överväg att ange humanInLoop för AI-transparens',
        en: 'Consider specifying humanInLoop for AI transparency',
    },
};
export function getProfileWarningMessage(key, lang) {
    const messages = PROFILE_WARNING_MESSAGES[key];
    if (!messages) {
        return lang === 'sv' ? `Okänd varning: ${key}` : `Unknown warning: ${key}`;
    }
    return messages[lang];
}
//# sourceMappingURL=profile-errors.js.map