/**
 * pcode init command - Interactive wizard to create publiccode.yml
 */

import { Command } from 'commander';
import { writeFileSync, existsSync } from 'fs';
import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { stringify } from 'yaml';
import {
  getCategories,
  getDISFase1Categories,
  scoreYaml,
  scoreProfile,
  type PublicCode,
  type Category,
  type Platform,
  type DevelopmentStatus,
  type SoftwareType,
  type XSamhallskodexProfile,
  type UIPlatform,
  type BackendArchitecture,
  type APIStyle,
  type IdentityMethod,
  type OpennessLevel,
  type DataLocality,
  type AIUseCase,
  UI_PLATFORMS,
  BACKEND_ARCHITECTURES,
  API_STYLES,
  IDENTITY_METHODS,
  OPENNESS_LEVELS,
  DATA_LOCALITIES,
  AI_USE_CASES,
  PROFILE_LABELS_SV,
} from '@samhallskodex/core';

export const initCommand = new Command('init')
  .description('Skapa en ny publiccode.yml interaktivt')
  .option('-o, --output <path>', 'Output-fil', './publiccode.yml')
  .option('-f, --force', 'Skriv över befintlig fil')
  .option('-l, --lang <lang>', 'Språk (sv/en)', 'sv')
  .option('-p, --with-profile', 'Inkludera x-samhallskodex profil')
  .action(async (options) => {
    const lang = (options.lang || 'sv') as 'sv' | 'en';
    const outputPath = options.output || './publiccode.yml';

    // Check if file exists
    if (existsSync(outputPath) && !options.force) {
      const { overwrite } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'overwrite',
          message:
            lang === 'sv'
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

    console.log(
      chalk.cyan(
        lang === 'sv'
          ? '\n🇸🇪 Välkommen till publiccode.yml-generatorn!\n'
          : '\n🇸🇪 Welcome to the publiccode.yml generator!\n'
      )
    );

    // Step 1: Basic info
    const basicInfo = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: lang === 'sv' ? 'Projektnamn:' : 'Project name:',
        validate: (input: string) =>
          input.length > 0 ||
          (lang === 'sv' ? 'Namn krävs' : 'Name is required'),
      },
      {
        type: 'input',
        name: 'shortDescription',
        message:
          lang === 'sv'
            ? 'Kort beskrivning (en rad):'
            : 'Short description (one line):',
        validate: (input: string) =>
          input.length > 0 ||
          (lang === 'sv' ? 'Beskrivning krävs' : 'Description is required'),
      },
      {
        type: 'input',
        name: 'url',
        message:
          lang === 'sv' ? 'URL till källkod:' : 'Source code URL:',
        validate: (input: string) => {
          if (!input) return lang === 'sv' ? 'URL krävs' : 'URL is required';
          try {
            new URL(input);
            return true;
          } catch {
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
        message:
          lang === 'sv' ? 'Ägare/organisation:' : 'Owner/organization:',
        validate: (input: string) =>
          input.length > 0 ||
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
        message:
          lang === 'sv'
            ? 'Välj kategorier (DIS Fas 1 markerade med *):'
            : 'Select categories (DIS Phase 1 marked with *):',
        choices: allCategories.map((cat) => ({
          name: `${cat[lang].name}${disFase1Ids.includes(cat.id) ? ' *' : ''} - ${cat[lang].description}`,
          value: cat.id,
          short: cat[lang].name,
        })),
        validate: (input: string[]) =>
          input.length > 0 ||
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
        validate: (input: string[]) =>
          input.length > 0 ||
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
        message:
          lang === 'sv'
            ? 'Vill du lägga till underhållsinformation?'
            : 'Do you want to add maintenance information?',
        default: true,
      },
    ]);

    let maintenanceInfo: {
      maintenanceType?: string;
      contactName?: string;
      contactEmail?: string;
    } = {};
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
          message:
            lang === 'sv' ? 'Kontaktperson (namn):' : 'Contact person (name):',
        },
        {
          type: 'input',
          name: 'contactEmail',
          message:
            lang === 'sv'
              ? 'Kontaktperson (e-post):'
              : 'Contact person (email):',
        },
      ]);
    }

    // Step 6: Profile (optional, if --with-profile)
    let profileData: XSamhallskodexProfile | undefined;
    if (options.withProfile) {
      console.log(
        chalk.cyan(
          lang === 'sv'
            ? '\n📊 x-samhallskodex Profil\n'
            : '\n📊 x-samhallskodex Profile\n'
        )
      );

      // Architecture - UI
      const uiInfo = await inquirer.prompt([
        {
          type: 'list',
          name: 'platform',
          message: lang === 'sv' ? 'UI-plattform:' : 'UI Platform:',
          choices: UI_PLATFORMS.map((p) => ({
            name: PROFILE_LABELS_SV[p] || p,
            value: p,
          })),
        },
        {
          type: 'input',
          name: 'framework',
          message: lang === 'sv' ? 'UI-ramverk (t.ex. React, Vue):' : 'UI Framework (e.g. React, Vue):',
        },
      ]);

      // Architecture - Backend
      const backendInfo = await inquirer.prompt([
        {
          type: 'list',
          name: 'architecture',
          message: lang === 'sv' ? 'Backend-arkitektur:' : 'Backend Architecture:',
          choices: BACKEND_ARCHITECTURES.map((a) => ({
            name: PROFILE_LABELS_SV[a] || a,
            value: a,
          })),
        },
        {
          type: 'input',
          name: 'runtime',
          message: lang === 'sv' ? 'Backend-runtime (t.ex. Node.js, .NET):' : 'Backend Runtime (e.g. Node.js, .NET):',
        },
      ]);

      // Integration
      const integrationInfo = await inquirer.prompt([
        {
          type: 'checkbox',
          name: 'apiStyles',
          message: lang === 'sv' ? 'API-stilar:' : 'API Styles:',
          choices: API_STYLES.map((s) => ({
            name: PROFILE_LABELS_SV[s] || s,
            value: s,
          })),
          validate: (input: string[]) =>
            input.length > 0 ||
            (lang === 'sv' ? 'Välj minst en API-stil' : 'Select at least one API style'),
        },
        {
          type: 'checkbox',
          name: 'identity',
          message: lang === 'sv' ? 'Identitetsmetoder:' : 'Identity Methods:',
          choices: IDENTITY_METHODS.map((m) => ({
            name: PROFILE_LABELS_SV[m] || m,
            value: m,
          })),
        },
      ]);

      // AI
      const aiInfo = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'enabled',
          message: lang === 'sv' ? 'Använder AI-funktionalitet?' : 'Uses AI functionality?',
          default: false,
        },
      ]);

      let aiDetails: { useCases?: AIUseCase[]; humanInLoop?: boolean } = {};
      if (aiInfo.enabled) {
        aiDetails = await inquirer.prompt([
          {
            type: 'checkbox',
            name: 'useCases',
            message: lang === 'sv' ? 'AI-användningsfall:' : 'AI Use Cases:',
            choices: AI_USE_CASES.map((uc) => ({
              name: PROFILE_LABELS_SV[uc] || uc,
              value: uc,
            })),
          },
          {
            type: 'confirm',
            name: 'humanInLoop',
            message: lang === 'sv' ? 'Kräver mänsklig kontroll?' : 'Requires human in the loop?',
            default: true,
          },
        ]);
      }

      // Governance
      const governanceInfo = await inquirer.prompt([
        {
          type: 'list',
          name: 'opennessLevel',
          message: lang === 'sv' ? 'Öppenhetsnivå:' : 'Openness Level:',
          choices: OPENNESS_LEVELS.map((l) => ({
            name: PROFILE_LABELS_SV[l] || l,
            value: l,
          })),
        },
        {
          type: 'list',
          name: 'dataLocality',
          message: lang === 'sv' ? 'Datalokalitet:' : 'Data Locality:',
          choices: DATA_LOCALITIES.map((l) => ({
            name: PROFILE_LABELS_SV[l] || l,
            value: l,
          })),
        },
      ]);

      // Build profile object
      profileData = {
        profileVersion: '0.1',
        architecture: {
          ui: {
            platform: uiInfo.platform as UIPlatform,
            framework: uiInfo.framework || undefined,
          },
          backend: {
            architecture: backendInfo.architecture as BackendArchitecture,
            runtime: backendInfo.runtime || undefined,
          },
        },
        integration: {
          apiStyles: integrationInfo.apiStyles as APIStyle[],
          identity: integrationInfo.identity?.length ? integrationInfo.identity as IdentityMethod[] : undefined,
        },
        ai: {
          enabled: aiInfo.enabled,
          useCases: aiDetails.useCases?.length ? aiDetails.useCases : undefined,
          humanInLoop: aiInfo.enabled ? aiDetails.humanInLoop : undefined,
        },
        governance: {
          opennessLevel: governanceInfo.opennessLevel as OpennessLevel,
          dataHosting: {
            locality: governanceInfo.dataLocality as DataLocality,
          },
        },
      };
    }

    // Build the publiccode object
    const spinner = ora(
      lang === 'sv' ? 'Skapar publiccode.yml...' : 'Creating publiccode.yml...'
    ).start();

    const publiccode: PublicCode = {
      publiccodeYmlVersion: '0.4',
      name: basicInfo.name,
      url: basicInfo.url,
      platforms: technicalInfo.platforms as Platform[],
      categories: categories as Category[],
      developmentStatus: technicalInfo.developmentStatus as DevelopmentStatus,
      softwareType: technicalInfo.softwareType as SoftwareType,
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
        type: maintenanceInfo.maintenanceType as 'internal' | 'contract' | 'community' | 'none',
        contacts: [],
      };
      if (maintenanceInfo.contactName) {
        publiccode.maintenance.contacts.push({
          name: maintenanceInfo.contactName,
          email: maintenanceInfo.contactEmail || undefined,
        });
      }
    }

    // Add profile if created
    if (profileData) {
      publiccode['x-samhallskodex'] = profileData;
    }

    // Write file
    const yamlContent = stringify(publiccode);
    writeFileSync(outputPath, yamlContent, 'utf-8');
    spinner.succeed(
      lang === 'sv'
        ? `publiccode.yml skapad: ${outputPath}`
        : `publiccode.yml created: ${outputPath}`
    );

    // Calculate and show score
    const result = scoreYaml(yamlContent, { lang });
    const scoreColor =
      result.total >= 80
        ? chalk.green
        : result.total >= 60
          ? chalk.yellow
          : chalk.red;

    console.log(
      `\n${lang === 'sv' ? 'DIS-Readiness Score' : 'DIS-Readiness Score'}: ${scoreColor(result.total + '/100')}`
    );

    // Show profile score if profile was added
    if (profileData) {
      const profileResult = scoreProfile(profileData, { lang });
      const profileScoreColor =
        profileResult.total >= 80
          ? chalk.green
          : profileResult.total >= 60
            ? chalk.yellow
            : chalk.red;

      console.log(
        `${lang === 'sv' ? 'Profile Score' : 'Profile Score'}: ${profileScoreColor(profileResult.total + '%')}`
      );

      // Show profile suggestions
      if (profileResult.suggestions.length > 0) {
        console.log(
          `\n${lang === 'sv' ? 'Profil-förbättringar' : 'Profile Improvements'}:`
        );
        for (const suggestion of profileResult.suggestions.slice(0, 3)) {
          console.log(
            `  - ${suggestion.message} ${chalk.dim(`(+${suggestion.potentialPoints}%)`)}`
          );
        }
      }
    }

    // Show top suggestions
    if (result.suggestions.length > 0) {
      console.log(
        `\n${lang === 'sv' ? 'DIS-förbättringsförslag' : 'DIS Suggestions'}:`
      );
      for (const suggestion of result.suggestions.slice(0, 3)) {
        console.log(
          `  - ${suggestion.message} ${chalk.dim(`(+${suggestion.potentialPoints} ${lang === 'sv' ? 'poäng' : 'points'})`)}`
        );
      }
    }

    console.log();
  });
