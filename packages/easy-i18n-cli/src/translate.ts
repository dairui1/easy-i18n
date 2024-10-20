import path from 'path';
import { get, set } from 'lodash-es';
import { translateChunks } from './core/translation';
import { writeFile, readFile, readDir } from './utils/file';
import { getConfig } from './config';
import consola from 'consola';

async function translateAllLocales(config: ReturnType<typeof getConfig>, targetFile?: string, targetKey?: string): Promise<void> {
  try {
    const projectRoot = process.cwd();
    const absoluteLocaleDir = path.join(projectRoot, config.localeDir);
    const allLocales = await readDir(absoluteLocaleDir);
    consola.info('Starting translation for all locales...');
    await Promise.all(allLocales.filter(locale => locale !== 'en')
      .map(locale => translateDir(locale, targetFile, targetKey)));
    consola.success('Translation completed for all locales');
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      consola.error(`Error: Locale directory not found: ${path.join(process.cwd(), config.localeDir)}`);
      consola.warn('Please check your configuration and ensure the localeDir is correct and the directory exists.');
    } else {
      consola.error('An unexpected error occurred while reading the locale directory:', error);
    }
  }
}

async function translateSingleFile(filePath: string, targetLocale: string, targetKey?: string) {
  consola.info(`Processing file: ${filePath}`);
  const data = await readFile(filePath);
  let localeJSON = data;

  if (targetKey) {
    const parsedData = JSON.parse(localeJSON);
    const targetObj = get(parsedData, targetKey);
    const isString = typeof targetObj === 'string';

    consola.info(`Translating ${isString ? 'single entry' : 'key-value pair'}: ${targetKey}`);
    localeJSON = JSON.stringify(isString ? { [targetKey]: targetObj } : targetObj, null, 2);
  }

  consola.start('Translating...');
  const translatedJSON = await translateChunks(localeJSON, targetLocale);
  consola.success('Translation completed');

  return translatedJSON;
}

async function writeTranslatedFile(targetFilePath: string, translatedJSON: any, targetKey?: string): Promise<void> {
  try {
    let finalJSON = translatedJSON;
    if (targetKey) {
      const originJSON = await readFile(targetFilePath);
      const originData = JSON.parse(originJSON);
      set(originData, targetKey, typeof translatedJSON[targetKey] === 'string' ? translatedJSON[targetKey] : translatedJSON);
      finalJSON = originData;
    }

    const jsonText = JSON.stringify(finalJSON, null, 2);
    consola.debug('Translated JSON:', jsonText);
    await writeFile(targetFilePath, jsonText);
    consola.success(`Successfully translated ${path.basename(targetFilePath)}`);
  } catch (e) {
    consola.error(`Error parsing translated JSON for ${targetFilePath}:`, e);
    consola.error('Problematic JSON:', translatedJSON);
  }
}

export async function translateDir(targetLocale: string, targetFile = '', targetKey?: string): Promise<void> {
  const config = getConfig();
  if (targetLocale === 'all') {
    await translateAllLocales(config, targetFile, targetKey);
    return;
  }

  consola.info(`Starting translation for locale: ${targetLocale}`);
  if (targetFile) consola.info(`Target file: ${targetFile}`);
  if (targetKey) consola.info(`Target key: ${targetKey}`);

  try {
    const files = await readDir(config.entry);
    const targetFiles = files.filter(file => file.endsWith(`${targetFile}.json`));
    
    if (targetFiles.length === 0) {
      consola.warn(`No matching files found for ${targetFile}.json`);
      return;
    }

    await Promise.all(targetFiles.map(async (file) => {
      const filePath = path.join(config.entry, file);
      const translatedJSON = await translateSingleFile(filePath, targetLocale, targetKey);
      const targetFilePath = path.join(config.localeDir, targetLocale, file);
      await writeTranslatedFile(targetFilePath, translatedJSON, targetKey);
    }));
  } catch (err) {
    consola.error('Error reading directory:', err);
  }
}