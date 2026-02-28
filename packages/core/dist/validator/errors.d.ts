/**
 * Error messages in Swedish and English
 */
export type Language = 'sv' | 'en';
export interface ErrorMessage {
    sv: string;
    en: string;
}
export declare const ERROR_MESSAGES: Record<string, ErrorMessage>;
/**
 * Get localized error message
 */
export declare function getErrorMessage(key: string, lang: Language, params?: Record<string, string>): string;
//# sourceMappingURL=errors.d.ts.map