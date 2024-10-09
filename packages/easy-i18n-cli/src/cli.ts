#!/usr/bin/env node

import { Command } from 'commander';
import { translateDir } from './translate';
import consola from 'consola';

import dotenv from 'dotenv';

// Initialize dotenv
dotenv.config();

// Ensure OPENAI_API_KEY is set
if (!process.env.OPENAI_API_KEY) {
  consola.error('OPENAI_API_KEY is not set in the environment variables.');
  process.exit(1);
}

const program = new Command();

program
  .version('0.1.0')
  .description('AI-powered i18n CLI tool')
  .option('-l, --locale <locale>', 'Target locale (use "all" for all locales)')
  .option('-f, --file <file>', 'Target file')
  .option('-k, --key <key>', 'Target key (optional)')
  .parse(process.argv);

const options = program.opts();

async function main() {
  if (options.locale) {
    const targetLocale = options.locale;
    const targetFile = options.file || '';
    const targetKey = options.key;

    try {
      await translateDir(targetLocale, targetFile, targetKey);
      consola.success('Translation completed successfully.');
    } catch (error: any) {
      consola.error('Error:', error.message);
    }
  } else {
    program.outputHelp();
  }
}

main();
