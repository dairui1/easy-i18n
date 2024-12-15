import path from 'path';
import consola from 'consola';
import { mapLimit } from 'async';
import lodash from 'lodash';
import { translateChunks } from './translate';
import { writeFile, readFile, readDir } from '../utils/file';
import { getConfig } from '../config';


/**
 * Translates all locales except 'en' based on the provided configuration.
 * @param config - The configuration object returned by getConfig()
 * @param targetFile - Optional. The specific file to translate
 * @param targetKey - Optional. The specific key within the file to translate
 */
async function translateAllLocales(config: ReturnType<typeof getConfig>, targetFile?: string, targetKey?: string): Promise<void> {
  try {
    const projectRoot = process.cwd();
    const absoluteLocaleDir = path.join(projectRoot, config.localeDir);
    const allLocales = await readDir(absoluteLocaleDir);
    consola.info(`Starting translation for all locales: ${allLocales.join(', ')}`);
    const locales = allLocales
      .map(locale => locale.replace(/\.[^.]+$/, ''))
      .filter(locale => locale !== 'en');
      
    for (const locale of locales) {
      await translateDir(locale, targetFile, targetKey);
    }
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

/**
 * Translates a single file or a specific key within a file.
 * @param filePath - The path to the file to be translated
 * @param targetLocale - The target locale for translation
 * @param targetKey - Optional. The specific key to translate within the file
 * @returns The translated JSON object
 */
async function translateSingleFile(filePath: string, targetLocale: string, targetKey?: string) {
  consola.info(`Processing file: ${filePath}`);
  const data = await readFile(filePath);
  let localeJSON = data;

  if (targetKey) {
    const parsedData = JSON.parse(localeJSON);
    const targetObj = lodash.get(parsedData, targetKey);
    const isString = typeof targetObj === 'string';

    consola.info(`Translating ${isString ? 'single entry' : 'key-value pair'}: ${targetKey}`);
    localeJSON = JSON.stringify(isString ? { [targetKey]: targetObj } : targetObj, null, 2);
  }

  const translatedJSON = await translateChunks(localeJSON, targetLocale);
  consola.success('Translation completed');

  return translatedJSON;
}

/**
 * Writes the translated JSON to the target file.
 * @param targetFilePath - The path where the translated file should be written
 * @param translatedJSON - The translated JSON object
 * @param targetKey - Optional. The specific key that was translated
 */
async function writeTranslatedFile(targetFilePath: string, translatedJSON: any, targetKey?: string): Promise<void> {
  try {
    let finalJSON = translatedJSON;
    if (targetKey) {
      const originJSON = await readFile(targetFilePath);
      const originData = JSON.parse(originJSON);
      lodash.set(originData, targetKey, typeof translatedJSON[targetKey] === 'string' ? translatedJSON[targetKey] : translatedJSON);
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

/**
 * Main function to translate a directory or specific file(s) to a target locale.
 * @param targetLocale - The target locale for translation
 * @param targetFile - Optional. The specific file to translate
 * @param targetKey - Optional. The specific key within the file to translate
 */
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
    if (config.entryType === 'file') {
      const filePath = config.entry;
      const translatedJSON = await translateSingleFile(filePath, targetLocale, targetKey);
      const targetFilePath = path.join(config.localeDir, `${targetLocale}.json`);
      await writeTranslatedFile(targetFilePath, translatedJSON, targetKey);
    } else {
      const files = await readDir(config.entry);
      const targetFiles = targetFile ? files.filter(file => file.endsWith(`${targetFile}.json`)) : files;
      
      if (targetFiles.length === 0) {
        consola.warn(`No matching files found${targetFile ? ` for ${targetFile}.json` : ''}`);
        return;
      }

      await mapLimit(targetFiles, config.concurrency, async (file: string) => {
        const filePath = path.join(config.entry, file);
        const translatedJSON = await translateSingleFile(filePath, targetLocale, targetKey);
        const targetFilePath = path.join(config.localeDir, targetLocale, file);
        await writeTranslatedFile(targetFilePath, translatedJSON, targetKey);
      });
    }
  } catch (err) {
    consola.error('Error during translation:', err);
  }
}