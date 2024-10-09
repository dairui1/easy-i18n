import { I18nCliConfig } from '../types/config';
import { explorer } from './explorer';

const DEFAULT_CONFIG: I18nCliConfig = {
  concurrency: 5,
  localeDirectoryPath: 'example/i18next/locales',
  entryDirectoryPath: 'example/i18next/locales/en',
};

export function getConfig(): I18nCliConfig {
  const userConfig = explorer.getConfigFile();
  return { ...DEFAULT_CONFIG, ...userConfig };
}
