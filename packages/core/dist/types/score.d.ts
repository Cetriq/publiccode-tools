/**
 * DIS-Readiness Score types
 */
export interface ScoreResult {
    total: number;
    breakdown: ScoreBreakdown;
    suggestions: Suggestion[];
}
export interface ScoreBreakdown {
    requiredFields: ScoreCategory;
    documentation: ScoreCategory;
    localisation: ScoreCategory;
    maintenance: ScoreCategory;
    disSpecific: ScoreCategory;
}
export interface ScoreCategory {
    score: number;
    maxScore: number;
    items: ScoreItem[];
}
export interface ScoreItem {
    name: string;
    score: number;
    maxScore: number;
    met: boolean;
}
export interface Suggestion {
    message: string;
    potentialPoints: number;
    priority: 'high' | 'medium' | 'low';
}
//# sourceMappingURL=score.d.ts.map