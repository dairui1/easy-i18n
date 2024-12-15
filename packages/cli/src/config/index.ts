import { explorer } from './explorer';

import { z } from 'zod';

const llmConfigSchema = z.object({
  model: z.string().default('gpt-4o'),
  temperature: z.number().default(0.3),
  maxRetries: z.number().default(3),
  topP: z.number().nullable().optional(),
}).default({
  model: 'gpt-4o',
  temperature: 0.3,
  maxRetries: 3,
  topP: null,
});

const configSchema = z.object({
  localeDir: z.string(),
  entry: z.string(),
  entryType: z.enum(['directory', 'file']).optional().default('directory'),
  concurrency: z.number().optional().default(5),
  llmConfig: llmConfigSchema,
});

export const getConfig = () => {
  const userConfig = explorer.getConfigFile();
  if (!userConfig) {
    throw new Error('Configuration error: No configuration file found. Please create a configuration file like "easyi18n.config.ts".');
  }

  try {
    return configSchema.parse(userConfig);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('\n');
      throw new Error(`Configuration validation error:\n${issues}`);
    }
    throw error;
  }
};
