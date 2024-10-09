import path from 'path';
import { get, set } from 'lodash-es';
import { translateChunks } from './services/translation';
import { writeFile, readFile, readDir } from './utils/fileUtils';
import { getConfig } from './config';
import consola from 'consola';

export async function translateDir(targetLocale: string, targetFile = '', targetKey?: string): Promise<void> {
  const config = getConfig();
  if (targetLocale === 'all') {
    try {
      const projectRoot = process.cwd();
      const absoluteLocaleDirectoryPath = path.join(projectRoot, config.localeDirectoryPath);
      const allLocales = await readDir(absoluteLocaleDirectoryPath);
      consola.info('Starting translation for all locales...');
      await Promise.all(allLocales.filter(locale => locale !== 'en')
        .map(locale => translateDir(locale, targetFile, targetKey)));

      consola.success('Translation completed for all locales');
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        consola.error(`Error: Locale directory not found: ${path.join(process.cwd(), config.localeDirectoryPath)}`);
        consola.warn('Please check your configuration and ensure the localeDirectoryPath is correct and the directory exists.');
      } else {
        consola.error('An unexpected error occurred while reading the locale directory:', error);
      }
    }
    return;
  }

  consola.info(`Starting translation for locale: ${targetLocale}`);
  if (targetFile) consola.info(`Target file: ${targetFile}`);
  if (targetKey) consola.info(`Target key: ${targetKey}`);

  try {
    const files = await readDir(config.entryDirectoryPath);
    const targetFiles = files.filter(file => file.endsWith(`${targetFile}.json`));
    
    if (targetFiles.length === 0) {
      consola.warn(`No matching files found for ${targetFile}.json`);
      return;
    }

    await Promise.all(targetFiles.map(async (file) => {
      const filePath = path.join(config.entryDirectoryPath, file);
      consola.info(`Processing file: ${filePath}`);
      const data = await readFile(filePath);
      let localeJSON = data.replace(/{{(\w+)}}/g, '${$1}');  // {{var}} 转换为 ${var} 来避免被错误翻译

      let notJson = false;
      if (targetKey) {
        const targetObj = get(JSON.parse(localeJSON), targetKey);
        if (typeof targetObj === 'string') notJson = true;

        if (notJson) {
          consola.info(`Translating single entry: ${targetKey}`);
          localeJSON = JSON.stringify({ [targetKey]: targetObj }, null, 2);
        } else {
          consola.info(`Translating key-value pair: ${targetKey}`);
          localeJSON = JSON.stringify(targetObj, null, 2);
        }
      }

      consola.start('Translating...');
      let translatedJSON = await translateChunks(localeJSON, targetLocale);
      consola.success('Translation completed');

      try {
        const targetFilePath = path.join(config.localeDirectoryPath, targetLocale, file);
        if (targetKey) {
          const originJSON = await readFile(targetFilePath);
          const originData = JSON.parse(originJSON);
          if (notJson) {
            set(originData, targetKey, translatedJSON[targetKey]);
          } else {
            set(originData, targetKey, translatedJSON);
          }

          translatedJSON = originData;
        }

        const jsonText = JSON.stringify(translatedJSON, null, 2);
        consola.debug('Translated JSON:', jsonText);
        await writeFile(targetFilePath, jsonText);
        consola.success(`Successfully translated ${file} to ${targetLocale}`);
      } catch (e) {
        consola.error(`Error parsing translated JSON for ${file}:`, e);
        consola.error('Problematic JSON:', translatedJSON);
      }
    }));
  } catch (err) {
    consola.error('Error reading directory:', err);
  }
}