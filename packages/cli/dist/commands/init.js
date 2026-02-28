/**
 * pcode init command - Interactive wizard to create publiccode.yml
 */
import { Command } from 'commander';
import { writeFileSync, existsSync } from 'fs';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { stringify } from 'yaml';
import { getCategories, getDISFase1Categories, scoreYaml, } from '@godwana/publiccode-core';
export const initCommand = new Command('init')
    .description('Skapa en ny publiccode.yml interaktivt')
    .option('-o, --output <path>', 'Output-fil', './publiccode.yml')
    .option('-f, --force', 'Skriv över befintlig fil')
    .option('-l, --lang <lang>', 'Språk (sv/en)', 'sv')
    .action(async (options) => {
    const lang = (options.lang || 'sv');
    const outputPath = options.output || './publiccode.yml';
    // Check if file exists
    if (existsSync(outputPath) && !options.force) {
        const { overwrite } = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'overwrite',
                message: lang === 'sv'
                    ? `Filen ${outputPath} finns redan. Vill du skriva över den?`
                    : `File ${outputPath} already exists. Overwrite?`,
                default: false,
            },
        ]);
        if (!overwrite) {
            console.log(chalk.yellow(lang === 'sv' ? 'Avbruten.' : 'Cancelled.'));
            return;
        }
    }
    console.log(chalk.cyan(lang === 'sv'
        ? '\n🇸🇪 Välkommen till publiccode.yml-generatorn!\n'
        : '\n🇸🇪 Welcome to the publiccode.yml generator!\n'));
    // Step 1: Basic info
    const basicInfo = await inquirer.prompt([
        {
            type: 'input',
            name: 'name',
            message: lang === 'sv' ? 'Projektnamn:' : 'Project name:',
            validate: (input) => input.length > 0 ||
                (lang === 'sv' ? 'Namn krävs' : 'Name is required'),
        },
        {
            type: 'input',
            name: 'shortDescription',
            message: lang === 'sv'
                ? 'Kort beskrivning (en rad):'
                : 'Short description (one line):',
            validate: (input) => input.length > 0 ||
                (lang === 'sv' ? 'Beskrivning krävs' : 'Description is required'),
        },
        {
            type: 'input',
            name: 'url',
            message: lang === 'sv' ? 'URL till källkod:' : 'Source code URL:',
            validate: (input) => {
                if (!input)
                    return lang === 'sv' ? 'URL krävs' : 'URL is required';
                try {
                    new URL(input);
                    return true;
                }
                catch {
                    return lang === 'sv' ? 'Ogiltig URL' : 'Invalid URL';
                }
            },
        },
    ]);
    // Step 2: License
    const { license } = await inquirer.prompt([
        {
            type: 'list',
            name: 'license',
            message: lang === 'sv' ? 'Licens:' : 'License:',
            choices: [
                { name: 'EUPL-1.2 (EU Public License)', value: 'EUPL-1.2' },
                { name: 'MIT', value: 'MIT' },
                { name: 'Apache-2.0', value: 'Apache-2.0' },
                { name: 'GPL-3.0', value: 'GPL-3.0' },
                { name: 'AGPL-3.0', value: 'AGPL-3.0' },
                { name: 'BSD-3-Clause', value: 'BSD-3-Clause' },
                {
                    name: lang === 'sv' ? 'Annan...' : 'Other...',
                    value: 'other',
                },
            ],
        },
    ]);
    let customLicense = '';
    if (license === 'other') {
        const result = await inquirer.prompt([
            {
                type: 'input',
                name: 'customLicense',
                message: lang === 'sv' ? 'Ange SPDX-identifierare:' : 'Enter SPDX identifier:',
            },
        ]);
        customLicense = result.customLicense;
    }
    const { repoOwner } = await inquirer.prompt([
        {
            type: 'input',
            name: 'repoOwner',
            message: lang === 'sv' ? 'Ägare/organisation:' : 'Owner/organization:',
            validate: (input) => input.length > 0 ||
                (lang === 'sv' ? 'Ägare krävs' : 'Owner is required'),
        },
    ]);
    // Step 3: Categories
    const allCategories = getCategories(lang);
    const disFase1Categories = getDISFase1Categories();
    const disFase1Ids = disFase1Categories.map((c) => c.id);
    const { categories } = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'categories',
            message: lang === 'sv'
                ? 'Välj kategorier (DIS Fas 1 markerade med *):'
                : 'Select categories (DIS Phase 1 marked with *):',
            choices: allCategories.map((cat) => ({
                name: `${cat[lang].name}${disFase1Ids.includes(cat.id) ? ' *' : ''} - ${cat[lang].description}`,
                value: cat.id,
                short: cat[lang].name,
            })),
            validate: (input) => input.length > 0 ||
                (lang === 'sv'
                    ? 'Välj minst en kategori'
                    : 'Select at least one category'),
        },
    ]);
    // Step 4: Technical info
    const technicalInfo = await inquirer.prompt([
        {
            type: 'checkbox',
            name: 'platforms',
            message: lang === 'sv' ? 'Plattformar:' : 'Platforms:',
            choices: [
                { name: 'Web', value: 'web', checked: true },
                { name: 'Windows', value: 'windows' },
                { name: 'macOS', value: 'mac' },
                { name: 'Linux', value: 'linux' },
                { name: 'iOS', value: 'ios' },
                { name: 'Android', value: 'android' },
            ],
            validate: (input) => input.length > 0 ||
                (lang === 'sv'
                    ? 'Välj minst en plattform'
                    : 'Select at least one platform'),
        },
        {
            type: 'list',
            name: 'developmentStatus',
            message: lang === 'sv' ? 'Utvecklingsstatus:' : 'Development status:',
            choices: [
                {
                    name: lang === 'sv' ? 'Stabil' : 'Stable',
                    value: 'stable',
                },
                { name: 'Beta', value: 'beta' },
                {
                    name: lang === 'sv' ? 'Under utveckling' : 'Development',
                    value: 'development',
                },
                { name: 'Koncept', value: 'concept' },
                {
                    name: lang === 'sv' ? 'Utgången' : 'Obsolete',
                    value: 'obsolete',
                },
            ],
        },
        {
            type: 'list',
            name: 'softwareType',
            message: lang === 'sv' ? 'Typ av programvara:' : 'Software type:',
            choices: [
                { name: 'Standalone Web', value: 'standalone/web' },
                { name: 'Standalone Backend', value: 'standalone/backend' },
                { name: 'Standalone Desktop', value: 'standalone/desktop' },
                { name: 'Standalone Mobile', value: 'standalone/mobile' },
                { name: 'Library', value: 'library' },
                { name: 'Addon', value: 'addon' },
                {
                    name: lang === 'sv' ? 'Övrigt' : 'Other',
                    value: 'standalone/other',
                },
            ],
        },
    ]);
    // Step 5: Maintenance (optional)
    const { addMaintenance } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'addMaintenance',
            message: lang === 'sv'
                ? 'Vill du lägga till underhållsinformation?'
                : 'Do you want to add maintenance information?',
            default: true,
        },
    ]);
    let maintenanceInfo = {};
    if (addMaintenance) {
        maintenanceInfo = await inquirer.prompt([
            {
                type: 'list',
                name: 'maintenanceType',
                message: lang === 'sv' ? 'Underhållstyp:' : 'Maintenance type:',
                choices: [
                    {
                        name: lang === 'sv' ? 'Intern' : 'Internal',
                        value: 'internal',
                    },
                    { name: 'Kontrakt', value: 'contract' },
                    { name: 'Community', value: 'community' },
                    {
                        name: lang === 'sv' ? 'Ingen' : 'None',
                        value: 'none',
                    },
                ],
            },
            {
                type: 'input',
                name: 'contactName',
                message: lang === 'sv' ? 'Kontaktperson (namn):' : 'Contact person (name):',
            },
            {
                type: 'input',
                name: 'contactEmail',
                message: lang === 'sv'
                    ? 'Kontaktperson (e-post):'
                    : 'Contact person (email):',
            },
        ]);
    }
    // Build the publiccode object
    const spinner = ora(lang === 'sv' ? 'Skapar publiccode.yml...' : 'Creating publiccode.yml...').start();
    const publiccode = {
        publiccodeYmlVersion: '0.4',
        name: basicInfo.name,
        url: basicInfo.url,
        platforms: technicalInfo.platforms,
        categories: categories,
        developmentStatus: technicalInfo.developmentStatus,
        softwareType: technicalInfo.softwareType,
        description: {
            sv: {
                shortDescription: basicInfo.shortDescription,
            },
        },
        legal: {
            license: license === 'other' ? customLicense : license,
            repoOwner: repoOwner,
        },
    };
    // Add maintenance if provided
    if (addMaintenance && maintenanceInfo.maintenanceType) {
        publiccode.maintenance = {
            type: maintenanceInfo.maintenanceType,
            contacts: [],
        };
        if (maintenanceInfo.contactName) {
            publiccode.maintenance.contacts.push({
                name: maintenanceInfo.contactName,
                email: maintenanceInfo.contactEmail || undefined,
            });
        }
    }
    // Write file
    const yamlContent = stringify(publiccode);
    writeFileSync(outputPath, yamlContent, 'utf-8');
    spinner.succeed(lang === 'sv'
        ? `publiccode.yml skapad: ${outputPath}`
        : `publiccode.yml created: ${outputPath}`);
    // Calculate and show score
    const result = scoreYaml(yamlContent, { lang });
    const scoreColor = result.total >= 80
        ? chalk.green
        : result.total >= 60
            ? chalk.yellow
            : chalk.red;
    console.log(`\n${lang === 'sv' ? 'DIS-Readiness Score' : 'DIS-Readiness Score'}: ${scoreColor(result.total + '/100')}`);
    // Show top suggestions
    if (result.suggestions.length > 0) {
        console.log(`\n${lang === 'sv' ? 'Förbättringsförslag' : 'Suggestions'}:`);
        for (const suggestion of result.suggestions.slice(0, 3)) {
            console.log(`  - ${suggestion.message} ${chalk.dim(`(+${suggestion.potentialPoints} ${lang === 'sv' ? 'poäng' : 'points'})`)}`);
        }
    }
    console.log();
});
//# sourceMappingURL=init.js.map