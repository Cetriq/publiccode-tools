/**
 * DIS-Readiness Score calculator
 */
import { parse as parseYaml } from 'yaml';
import { scoreRequiredFields, scoreDocumentation, scoreLocalisation, scoreMaintenance, scoreDISSpecific, } from './rules.js';
/**
 * Calculate DIS-Readiness Score for a PublicCode object
 */
export function score(publiccode, options = {}) {
    const lang = options.lang ?? 'sv';
    // Calculate each category
    const requiredFields = scoreRequiredFields(publiccode, lang);
    const documentation = scoreDocumentation(publiccode, lang);
    const localisation = scoreLocalisation(publiccode, lang);
    const maintenance = scoreMaintenance(publiccode, lang);
    const disSpecific = scoreDISSpecific(publiccode, lang);
    // Build breakdown
    const breakdown = {
        requiredFields: {
            score: requiredFields.items.reduce((sum, item) => sum + item.score, 0),
            maxScore: 40,
            items: requiredFields.items,
        },
        documentation: {
            score: documentation.items.reduce((sum, item) => sum + item.score, 0),
            maxScore: 20,
            items: documentation.items,
        },
        localisation: {
            score: localisation.items.reduce((sum, item) => sum + item.score, 0),
            maxScore: 15,
            items: localisation.items,
        },
        maintenance: {
            score: maintenance.items.reduce((sum, item) => sum + item.score, 0),
            maxScore: 15,
            items: maintenance.items,
        },
        disSpecific: {
            score: disSpecific.items.reduce((sum, item) => sum + item.score, 0),
            maxScore: 10,
            items: disSpecific.items,
        },
    };
    // Calculate total
    const total = breakdown.requiredFields.score +
        breakdown.documentation.score +
        breakdown.localisation.score +
        breakdown.maintenance.score +
        breakdown.disSpecific.score;
    // Collect and sort suggestions by priority
    const allSuggestions = [
        ...requiredFields.suggestions,
        ...documentation.suggestions,
        ...localisation.suggestions,
        ...maintenance.suggestions,
        ...disSpecific.suggestions,
    ];
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    allSuggestions.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    return {
        total,
        breakdown,
        suggestions: allSuggestions,
    };
}
/**
 * Calculate DIS-Readiness Score from YAML string
 */
export function scoreYaml(yaml, options = {}) {
    const publiccode = parseYaml(yaml);
    return score(publiccode, options);
}
/**
 * Generate a badge URL for the score
 */
export function getBadgeUrl(totalScore) {
    let color = 'red';
    if (totalScore >= 80) {
        color = 'brightgreen';
    }
    else if (totalScore >= 60) {
        color = 'green';
    }
    else if (totalScore >= 40) {
        color = 'yellow';
    }
    else if (totalScore >= 20) {
        color = 'orange';
    }
    return `https://img.shields.io/badge/DIS--Readiness-${totalScore}%25-${color}`;
}
//# sourceMappingURL=scorer.js.map