/**
 * Configuration interface for the i18n CLI tool.
 */
export interface I18nCliConfig {
  /**
   * The number of concurrent operations to run.
   */
  concurrency: number;

  /**
   * The path to the directory containing locale files.
   */
  localeDirectoryPath: string;

  /**
   * The path to the entry directory for processing.
   */
  entryDirectoryPath: string;
}

/**
 * Configuration interface for environment variables.
 */
export interface EnvConfig {
  /**
   * OpenAI API Key for authentication.
   */
  OPENAI_API_KEY: string;

  /**
   * OpenAI API Host URL.
   */
  OPENAI_API_HOST: string;
}
