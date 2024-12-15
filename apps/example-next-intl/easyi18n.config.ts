import { defineConfig } from '@easyi18n/cli';

export default defineConfig({
  localeDir: 'translations',
  entryType: 'file',
  entry: 'translations/en.json',
  concurrency: 5,
  llmConfig: {
    model: 'deepseek-ai/DeepSeek-V2.5',
    temperature: 0,
    maxRetries: 2,
    topP: undefined,
  }
});
