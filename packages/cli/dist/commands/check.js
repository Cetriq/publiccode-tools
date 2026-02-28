/**
 * pcode check command - Check a GitHub repository for publiccode.yml
 */
import { Command } from 'commander';
import chalk from 'chalk';
import { validate, scoreYaml } from '@samhallskodex/core';
/**
 * Parse GitHub URL to extract owner and repo
 */
function parseGitHubUrl(url) {
    // Handle various GitHub URL formats
    const patterns = [
        /github\.com\/([^/]+)\/([^/]+?)(?:\.git)?(?:\/.*)?$/,
        /^([^/]+)\/([^/]+)$/, // shorthand: owner/repo
    ];
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
            return { owner: match[1], repo: match[2].replace(/\.git$/, '') };
        }
    }
    return null;
}
/**
 * Fetch publiccode.yml from GitHub
 */
async function fetchPubliccodeFromGitHub(owner, repo, branch = 'main') {
    const paths = ['publiccode.yml', 'publiccode.yaml'];
    const branches = [branch, 'main', 'master'];
    for (const b of branches) {
        for (const path of paths) {
            const url = `https://raw.githubusercontent.com/${owner}/${repo}/${b}/${path}`;
            try {
                const response = await fetch(url);
                if (response.ok) {
                    return await response.text();
                }
            }
            catch {
                // Try next path
            }
        }
    }
    return null;
}
export const checkCommand = new Command('check')
    .description('Kontrollera ett GitHub-repos publiccode.yml')
    .argument('<repo>', 'GitHub URL eller owner/repo (t.ex. dis-tools/publiccode-tools)')
    .option('-b, --branch <branch>', 'Branch att kolla', 'main')
    .option('--detailed', 'Visa detaljerad poänguppdelning')
    .option('--json', 'Output som JSON')
    .option('-l, --lang <lang>', 'Språk (sv/en)', 'sv')
    .action(async (repo, options) => {
    const lang = (options.lang || 'sv');
    // Parse GitHub URL
    const parsed = parseGitHubUrl(repo);
    if (!parsed) {
        console.error(chalk.red(lang === 'sv'
            ? `Fel: Kunde inte tolka GitHub-URL: ${repo}`
            : `Error: Could not parse GitHub URL: ${repo}`));
        console.log(chalk.dim(lang === 'sv'
            ? 'Använd format: owner/repo eller https://github.com/owner/repo'
            : 'Use format: owner/repo or https://github.com/owner/repo'));
        process.exit(1);
    }
    console.log(chalk.dim(lang === 'sv'
        ? `Hämtar publiccode.yml från ${parsed.owner}/${parsed.repo}...`
        : `Fetching publiccode.yml from ${parsed.owner}/${parsed.repo}...`));
    // Fetch the file
    const yaml = await fetchPubliccodeFromGitHub(parsed.owner, parsed.repo, options.branch);
    if (!yaml) {
        console.error(chalk.red(lang === 'sv'
            ? `\n✗ Ingen publiccode.yml hittades i ${parsed.owner}/${parsed.repo}`
            : `\n✗ No publiccode.yml found in ${parsed.owner}/${parsed.repo}`));
        console.log(chalk.dim(lang === 'sv'
            ? '\nTips: Skapa en med "pcode init" eller använd webbredigeraren på https://dis-tools.se/editor'
            : '\nTip: Create one with "pcode init" or use the web editor at https://dis-tools.se/editor'));
        process.exit(1);
    }
    console.log(chalk.green(lang === 'sv' ? '✓ publiccode.yml hittades!\n' : '✓ publiccode.yml found!\n'));
    // Validate
    const validation = validate(yaml, { lang });
    // JSON output
    if (options.json) {
        const score = scoreYaml(yaml, { lang });
        console.log(JSON.stringify({
            repo: `${parsed.owner}/${parsed.repo}`,
            validation,
            score,
        }, null, 2));
        return;
    }
    if (!validation.valid) {
        console.log(chalk.red(lang === 'sv' ? '✗ Validering misslyckades' : '✗ Validation failed'));
        if (validation.errors.length > 0) {
            console.log(chalk.red(`\n${lang === 'sv' ? 'Fel' : 'Errors'} (${validation.errors.length}):`));
            for (const err of validation.errors) {
                console.log(chalk.red(`  • ${err.path}: ${err.message}`));
            }
        }
        console.log();
    }
    else {
        console.log(chalk.green(lang === 'sv' ? '✓ Validering lyckades!' : '✓ Validation passed!'));
        if (validation.warnings.length > 0) {
            console.log(chalk.yellow(`\n${lang === 'sv' ? 'Varningar' : 'Warnings'} (${validation.warnings.length}):`));
            for (const warn of validation.warnings) {
                console.log(chalk.yellow(`  • ${warn.path}: ${warn.message}`));
            }
        }
    }
    // Score
    const result = scoreYaml(yaml, { lang });
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
            { key: 'requiredFields', sv: 'Obligatoriska fält', en: 'Required fields' },
            { key: 'documentation', sv: 'Dokumentation', en: 'Documentation' },
            { key: 'localisation', sv: 'Lokalisering', en: 'Localisation' },
            { key: 'maintenance', sv: 'Underhåll', en: 'Maintenance' },
            { key: 'disSpecific', sv: 'DIS-specifikt', en: 'DIS-specific' },
        ];
        for (const cat of categories) {
            const breakdown = result.breakdown[cat.key];
            const catColor = breakdown.score === breakdown.maxScore ? chalk.green : chalk.yellow;
            console.log(`  ${lang === 'sv' ? cat.sv : cat.en}: ${catColor(`${breakdown.score}/${breakdown.maxScore}`)}`);
            for (const item of breakdown.items) {
                const icon = item.met ? chalk.green('✓') : chalk.red('✗');
                console.log(`    ${icon} ${item.name}: ${item.score}/${item.maxScore}`);
            }
        }
    }
    // Suggestions
    if (result.suggestions.length > 0) {
        console.log(`\n${lang === 'sv' ? 'Förbättringsförslag' : 'Suggestions'}:`);
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
    // Summary link
    console.log(chalk.dim(`\n${lang === 'sv' ? 'Repo' : 'Repo'}: https://github.com/${parsed.owner}/${parsed.repo}`));
    console.log();
});
//# sourceMappingURL=check.js.map