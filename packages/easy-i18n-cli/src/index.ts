import type { I18nCliConfig } from './types/config';

export type Config = I18nCliConfig;
export const defineConfig = (config: Partial<Config>): Config => {
  return config as Config;
};
