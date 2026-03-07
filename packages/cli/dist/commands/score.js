/**
 * pcode score command
 */
import { Command } from 'commander';
import { readFileSync, existsSync } from 'fs';
import chalk from 'chalk';
import { parse as parseYaml } from 'yaml';
import { scoreYaml, scoreProfile, getBadgeUrl } from '@samhallskodex/core';
export const scoreCommand = new Command('score')
    .description('Beräkna DIS-Readiness Score')
    .argument('[path]', 'Sökväg till publiccode.yml', './publiccode.yml')
    .option('--detailed', 'Visa detaljerad poänguppdelning')
    .option('--json', 'Output som JSON')
    .option('--badge', 'Generera badge-URL')
    .option('-l, --lang <lang>', 'Språk (sv/en)', 'sv')
    .action((path, options) => {
    const lang = (options.lang || 'sv');
    // Check if file exists
    if (!existsSync(path)) {
        console.error(chalk.red(lang === 'sv'
            ? `Fel: Filen '${path}' hittades inte`
            : `Error: File '${path}' not found`));
        process.exit(1);
    }
    // Read and score
    const yaml = readFileSync(path, 'utf-8');
    const result = scoreYaml(yaml, { lang });
    // Output as JSON
    if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
    }
    // Badge URL
    if (options.badge) {
        console.log(getBadgeUrl(result.total));
        return;
    }
    // Score display
    const scoreColor = result.total >= 80
        ? chalk.green
        : result.total >= 60
            ? chalk.yellow
            : result.total >= 40
                ? chalk.hex('#FFA500')
                : chalk.red;
    console.log(`\n${lang === 'sv' ? 'DIS-Readiness Score' : 'DIS-Readiness Score'}: ${scoreColor(result.total + '/100')}`);
    // Progress bar
    const barWidth = 40;
    const filledWidth = Math.round((result.total / 100) * barWidth);
    const bar = '█'.repeat(filledWidth) + '░'.repeat(barWidth - filledWidth);
    console.log(scoreColor(bar));
    // Detailed breakdown
    if (options.detailed) {
        console.log(`\n${lang === 'sv' ? 'Poänguppdelning' : 'Score breakdown'}:`);
        const categories = [
            {
                key: 'requiredFields',
                sv: 'Obligatoriska fält',
                en: 'Required fields',
            },
            { key: 'documentation', sv: 'Dokumentation', en: 'Documentation' },
            { key: 'localisation', sv: 'Lokalisering', en: 'Localisation' },
            { key: 'maintenance', sv: 'Underhåll', en: 'Maintenance' },
            { key: 'disSpecific', sv: 'DIS-specifikt', en: 'DIS-specific' },
        ];
        for (const cat of categories) {
            const breakdown = result.breakdown[cat.key];
            const catColor = breakdown.score === breakdown.maxScore ? chalk.green : chalk.yellow;
            console.log(`  ${lang === 'sv' ? cat.sv : cat.en}: ${catColor(`${breakdown.score}/${breakdown.maxScore}`)}`);
            // Show individual items
            for (const item of breakdown.items) {
                const icon = item.met ? chalk.green('✓') : chalk.red('✗');
                console.log(`    ${icon} ${item.name}: ${item.score}/${item.maxScore}`);
            }
        }
    }
    // Suggestions
    if (result.suggestions.length > 0) {
        console.log(`\n${lang === 'sv' ? 'DIS-förbättringsförslag' : 'DIS Suggestions'}:`);
        for (const suggestion of result.suggestions.slice(0, 5)) {
            const priorityIcon = suggestion.priority === 'high'
                ? chalk.red('!')
                : suggestion.priority === 'medium'
                    ? chalk.yellow('•')
                    : chalk.dim('○');
            console.log(`  ${priorityIcon} ${suggestion.message} ${chalk.dim(`(+${suggestion.potentialPoints} ${lang === 'sv' ? 'poäng' : 'points'})`)}`);
        }
        if (result.suggestions.length > 5) {
            console.log(chalk.dim(`  ... ${lang === 'sv' ? 'och' : 'and'} ${result.suggestions.length - 5} ${lang === 'sv' ? 'till' : 'more'}`));
        }
    }
    // Profile Score (if present)
    try {
        const data = parseYaml(yaml);
        if (data['x-samhallskodex']) {
            const profileResult = scoreProfile(data['x-samhallskodex'], { lang });
            const profileScoreColor = profileResult.total >= 80
                ? chalk.green
                : profileResult.total >= 60
                    ? chalk.yellow
                    : profileResult.total >= 40
                        ? chalk.hex('#FFA500')
                        : chalk.red;
            console.log(`\n${lang === 'sv' ? 'Profile Score' : 'Profile Score'}: ${profileScoreColor(profileResult.total + '%')}`);
            // Profile progress bar
            const profileFilledWidth = Math.round((profileResult.total / 100) * barWidth);
            const profileBar = '█'.repeat(profileFilledWidth) + '░'.repeat(barWidth - profileFilledWidth);
            console.log(profileScoreColor(profileBar));
            // Detailed profile breakdown
            if (options.detailed) {
                console.log(`\n${lang === 'sv' ? 'Profil-uppdelning' : 'Profile breakdown'}:`);
                const sections = [
                    { key: 'profileVersion', sv: 'Profilversion', en: 'Profile Version' },
                    { key: 'architecture', sv: 'Arkitektur', en: 'Architecture' },
                    { key: 'integration', sv: 'Integration', en: 'Integration' },
                    { key: 'ai', sv: 'AI', en: 'AI' },
                    { key: 'quality', sv: 'Kvalitet', en: 'Quality' },
                    { key: 'governance', sv: 'Styrning', en: 'Governance' },
                ];
                for (const section of sections) {
                    const sectionData = profileResult.breakdown[section.key];
                    const sectionColor = sectionData.percentage === 100 ? chalk.green : chalk.yellow;
                    console.log(`  ${lang === 'sv' ? section.sv : section.en}: ${sectionColor(`${sectionData.earned}/${sectionData.max} (${sectionData.percentage}%)`)}`);
                    // Show individual items
                    for (const item of sectionData.items) {
                        const icon = item.fulfilled ? chalk.green('✓') : chalk.red('✗');
                        console.log(`    ${icon} ${item.label}: ${item.points}/${item.maxPoints}`);
                    }
                }
            }
            // Profile suggestions
            if (profileResult.suggestions.length > 0) {
                console.log(`\n${lang === 'sv' ? 'Profil-förbättringsförslag' : 'Profile Suggestions'}:`);
                for (const suggestion of profileResult.suggestions.slice(0, 5)) {
                    const priorityIcon = suggestion.priority === 'high'
                        ? chalk.red('!')
                        : suggestion.priority === 'medium'
                            ? chalk.yellow('•')
                            : chalk.dim('○');
                    console.log(`  ${priorityIcon} ${suggestion.message} ${chalk.dim(`(+${suggestion.potentialPoints}%)`)}`);
                }
                if (profileResult.suggestions.length > 5) {
                    console.log(chalk.dim(`  ... ${lang === 'sv' ? 'och' : 'and'} ${profileResult.suggestions.length - 5} ${lang === 'sv' ? 'till' : 'more'}`));
                }
            }
        }
    }
    catch {
        // Ignore YAML parsing errors for profile - main score is already calculated
    }
    console.log();
});
//# sourceMappingURL=score.js.map