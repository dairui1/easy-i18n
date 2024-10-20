import { memoize } from 'lodash-es';
import { I18nCliConfig } from '../types/config';
import { explorer } from './explorer';

const DEFAULT_CONFIG: I18nCliConfig = {
  localeDir: 'example/i18next/locales',
  entryType: 'directory',
  entry: 'example/i18next/locales/en',
  concurrency: 5,
  llmConfig: {
    model: 'anthropic/claude-3.5-sonnet',
    temperature: 0,
    maxRetries: 2,
    topP: undefined,
  }
};

export const getConfig = memoize(() => {
  const userConfig = explorer.getConfigFile();
  return { ...DEFAULT_CONFIG, ...userConfig };
}) as () => I18nCliConfig;
