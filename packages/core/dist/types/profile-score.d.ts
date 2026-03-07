/**
 * Profile Score Types
 * Separate scoring system for x-samhallskodex profile (0-100%)
 */
export interface ProfileScoreResult {
    /** Total score as percentage (0-100) */
    total: number;
    /** Whether the profile has all required fields */
    valid: boolean;
    /** Breakdown by section */
    breakdown: ProfileScoreBreakdown;
    /** Suggestions for improvement */
    suggestions: ProfileSuggestion[];
}
export interface ProfileScoreBreakdown {
    profileVersion: ProfileSectionScore;
    architecture: ProfileSectionScore;
    integration: ProfileSectionScore;
    ai: ProfileSectionScore;
    quality: ProfileSectionScore;
    governance: ProfileSectionScore;
}
export interface ProfileSectionScore {
    /** Points earned */
    earned: number;
    /** Maximum possible points */
    max: number;
    /** Percentage (0-100) */
    percentage: number;
    /** Individual items in this section */
    items: ProfileScoreItem[];
}
export interface ProfileScoreItem {
    /** Field path (e.g., "architecture.ui.platform") */
    field: string;
    /** Swedish label */
    label: string;
    /** Whether the field is filled */
    fulfilled: boolean;
    /** Points for this item */
    points: number;
    /** Maximum points */
    maxPoints: number;
}
export interface ProfileSuggestion {
    /** Suggestion message in current language */
    message: string;
    /** Field path */
    field: string;
    /** Potential points if fixed */
    potentialPoints: number;
    /** Priority: high, medium, low */
    priority: 'high' | 'medium' | 'low';
}
export declare const PROFILE_SCORE_WEIGHTS: {
    readonly profileVersion: 5;
    readonly architecture: 25;
    readonly integration: 20;
    readonly ai: 15;
    readonly quality: 15;
    readonly governance: 20;
};
export declare const PROFILE_FIELD_WEIGHTS: {
    readonly 'architecture.ui.platform': 5;
    readonly 'architecture.ui.framework': 5;
    readonly 'architecture.backend.architecture': 5;
    readonly 'architecture.backend.runtime': 5;
    readonly 'architecture.deployment.hosting': 5;
    readonly 'integration.apiStyles': 10;
    readonly 'integration.identity': 10;
    readonly 'ai.enabled': 5;
    readonly 'ai.useCases': 5;
    readonly 'ai.humanInLoop': 5;
    readonly 'quality.uxRating': 5;
    readonly 'quality.apiMaturity': 5;
    readonly 'quality.documentationMaturity': 5;
    readonly 'governance.opennessLevel': 10;
    readonly 'governance.dataHosting.locality': 5;
    readonly 'governance.vendorDependency': 5;
};
//# sourceMappingURL=profile-score.d.ts.map