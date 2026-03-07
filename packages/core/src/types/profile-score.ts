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

// Score weights for each section (must sum to 100)
export const PROFILE_SCORE_WEIGHTS = {
  profileVersion: 5,
  architecture: 25,
  integration: 20,
  ai: 15,
  quality: 15,
  governance: 20,
} as const;

// Individual field weights within sections
export const PROFILE_FIELD_WEIGHTS = {
  // Architecture (25%)
  'architecture.ui.platform': 5,
  'architecture.ui.framework': 5,
  'architecture.backend.architecture': 5,
  'architecture.backend.runtime': 5,
  'architecture.deployment.hosting': 5,

  // Integration (20%)
  'integration.apiStyles': 10,
  'integration.identity': 10,

  // AI (15%)
  'ai.enabled': 5,
  'ai.useCases': 5,
  'ai.humanInLoop': 5,

  // Quality (15%)
  'quality.uxRating': 5,
  'quality.apiMaturity': 5,
  'quality.documentationMaturity': 5,

  // Governance (20%)
  'governance.opennessLevel': 10,
  'governance.dataHosting.locality': 5,
  'governance.vendorDependency': 5,
} as const;
