import { getConfig } from '../../config';

describe('Config Management', () => {
  it('should load and validate config correctly', () => {
    const config = getConfig();
    expect(config).toHaveProperty('localeDir');
    expect(config).toHaveProperty('entry'); 
    expect(config).toHaveProperty('entryType');
    expect(config).toHaveProperty('concurrency');
    expect(config).toHaveProperty('llmConfig');
    expect(config.llmConfig).toHaveProperty('model');
    expect(config.llmConfig).toHaveProperty('temperature');
    expect(config.llmConfig).toHaveProperty('maxRetries');
  });

  it('should have correct default values', () => {
    const config = getConfig();
    expect(config.entryType).toBe('directory');
    expect(config.concurrency).toBe(5);
    expect(config.llmConfig.temperature).toBe(0.3);
    expect(config.llmConfig.maxRetries).toBe(3);
  });

  it('should validate config types', () => {
    const config = getConfig();
    expect(typeof config.localeDir).toBe('string');
    expect(typeof config.entry).toBe('string');
    expect(typeof config.concurrency).toBe('number');
    expect(typeof config.llmConfig.model).toBe('string');
    expect(typeof config.llmConfig.temperature).toBe('number');
    expect(typeof config.llmConfig.maxRetries).toBe('number');
  });
});