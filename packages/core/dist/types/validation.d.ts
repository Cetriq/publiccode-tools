/**
 * Validation result types
 */
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
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
//# sourceMappingURL=validation.d.ts.map