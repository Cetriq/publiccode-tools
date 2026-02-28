/**
 * pcode categories command
 */
import { Command } from 'commander';
import chalk from 'chalk';
import { getCategories, searchCategories, getDISFase1Categories, } from '@godwana/publiccode-core';
export const categoriesCommand = new Command('categories')
    .description('Lista och sök kategorier')
    .option('-s, --search <query>', 'Sök i kategorier')
    .option('--dis-fase1', 'Visa endast DIS Fas 1-kategorier')
    .option('--json', 'Output som JSON')
    .option('-l, --lang <lang>', 'Språk (sv/en)', 'sv')
    .action((options) => {
    const lang = (options.lang || 'sv');
    let categories;
    if (options.search) {
        categories = searchCategories(options.search, lang);
    }
    else if (options.disFase1) {
        categories = getDISFase1Categories();
    }
    else {
        categories = getCategories(lang);
    }
    // JSON output
    if (options.json) {
        console.log(JSON.stringify(categories, null, 2));
        return;
    }
    // Header
    if (options.search) {
        console.log(`\n${lang === 'sv' ? 'Sökresultat för' : 'Search results for'} "${options.search}":`);
    }
    else if (options.disFase1) {
        console.log(`\n${lang === 'sv' ? 'DIS Fas 1-kategorier' : 'DIS Phase 1 categories'}:`);
    }
    else {
        console.log(`\n${lang === 'sv' ? 'Tillgängliga kategorier' : 'Available categories'} (${categories.length}):`);
    }
    // List categories
    for (const cat of categories) {
        const translation = cat[lang];
        const disTag = cat.disFase1 ? chalk.cyan(' [DIS Fas 1]') : '';
        console.log(`\n  ${chalk.bold(cat.id)}${disTag}`);
        console.log(`    ${translation.name}`);
        console.log(chalk.dim(`    ${translation.description}`));
    }
    if (categories.length === 0) {
        console.log(chalk.yellow(lang === 'sv'
            ? '  Inga kategorier hittades'
            : '  No categories found'));
    }
    console.log();
});
//# sourceMappingURL=categories.js.map