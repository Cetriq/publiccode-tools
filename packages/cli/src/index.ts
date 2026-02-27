#!/usr/bin/env node
/**
 * pcode CLI - publiccode.yml validation and generation tool
 */

import { Command } from 'commander';
import { validateCommand } from './commands/validate.js';
import { scoreCommand } from './commands/score.js';
import { categoriesCommand } from './commands/categories.js';
import { initCommand } from './commands/init.js';
import { checkCommand } from './commands/check.js';

const program = new Command();

program
  .name('pcode')
  .description('Verktyg för publiccode.yml och DIS-Readiness')
  .version('0.1.0')
  .option('-l, --lang <lang>', 'Språk för output (sv/en)', 'sv');

// Register commands
program.addCommand(validateCommand);
program.addCommand(scoreCommand);
program.addCommand(categoriesCommand);
program.addCommand(initCommand);
program.addCommand(checkCommand);

program.parse();
