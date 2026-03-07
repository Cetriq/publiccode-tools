/**
 * pcode validate command
 */

import { Command } from 'commander';
import { readFileSync, existsSync } from 'fs';
import chalk from 'chalk';
import { validate, type Language } from '@samhallskodex/core';

export const validateCommand = new Command('validate')
  .description('Validera en publiccode.yml-fil')
  .argument('[path]', 'Sökväg till publiccode.yml', './publiccode.yml')
  .option('--strict', 'Behandla varningar som fel')
  .option('--format <format>', 'Output-format (text/json)', 'text')
  .option('-l, --lang <lang>', 'Språk (sv/en)', 'sv')
  .action((path, options) => {
    const lang = (options.lang || 'sv') as Language;

    // Check if file exists
    if (!existsSync(path)) {
      console.error(
        chalk.red(
          lang === 'sv'
            ? `Fel: Filen '${path}' hittades inte`
            : `Error: File '${path}' not found`
        )
      );
      process.exit(1);
    }

    // Read and validate
    const yaml = readFileSync(path, 'utf-8');
    const result = validate(yaml, { lang });

    // Output as JSON
    if (options.format === 'json') {
      console.log(JSON.stringify(result, null, 2));
      process.exit(result.valid ? 0 : 1);
    }

    // Text output
    if (result.valid) {
      console.log(
        chalk.green(
          lang === 'sv' ? '✓ Validering lyckades!' : '✓ Validation passed!'
        )
      );
    } else {
      console.log(
        chalk.red(
          lang === 'sv' ? '✗ Validering misslyckades' : '✗ Validation failed'
        )
      );
    }

    // Show errors
    if (result.errors.length > 0) {
      console.log(
        chalk.red(
          `\n${lang === 'sv' ? 'Fel' : 'Errors'} (${result.errors.length}):`
        )
      );
      for (const error of result.errors) {
        console.log(chalk.red(`  • ${error.path}: ${error.message}`));
      }
    }

    // Show warnings
    if (result.warnings.length > 0) {
      console.log(
        chalk.yellow(
          `\n${lang === 'sv' ? 'Varningar' : 'Warnings'} (${result.warnings.length}):`
        )
      );
      for (const warning of result.warnings) {
        console.log(chalk.yellow(`  • ${warning.path}: ${warning.message}`));
        if (warning.suggestion) {
          console.log(chalk.dim(`    → ${warning.suggestion}`));
        }
      }
    }

    // Show profile validation if present
    if (result.profileValidation) {
      const pv = result.profileValidation;
      if (pv.valid) {
        console.log(
          chalk.green(
            `\n${lang === 'sv' ? '✓ Profil-validering lyckades!' : '✓ Profile validation passed!'}`
          )
        );
      } else {
        console.log(
          chalk.red(
            `\n${lang === 'sv' ? '✗ Profil-validering misslyckades' : '✗ Profile validation failed'}`
          )
        );
      }

      // Show profile errors
      if (pv.errors.length > 0) {
        console.log(
          chalk.red(
            `${lang === 'sv' ? 'Profil-fel' : 'Profile Errors'} (${pv.errors.length}):`
          )
        );
        for (const error of pv.errors) {
          console.log(chalk.red(`  • ${error.path}: ${error.message}`));
        }
      }

      // Show profile warnings
      if (pv.warnings.length > 0) {
        console.log(
          chalk.yellow(
            `${lang === 'sv' ? 'Profil-varningar' : 'Profile Warnings'} (${pv.warnings.length}):`
          )
        );
        for (const warning of pv.warnings) {
          console.log(chalk.yellow(`  • ${warning.path}: ${warning.message}`));
        }
      }
    }

    // Exit code
    if (!result.valid || (options.strict && result.warnings.length > 0)) {
      process.exit(1);
    }
  });
