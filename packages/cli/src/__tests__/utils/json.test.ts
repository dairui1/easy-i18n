import { chunkJson, parseLLMOutputForSchema } from '../../utils/json';
import { z } from 'zod';

describe('JSON Utils', () => {
  describe('chunkJson', () => {
    it('should split JSON into chunks correctly', () => {
      const input = {
        key1: 'value1',
        key2: 'value2',
        key3: 'value3'
      };

      const chunks = chunkJson(JSON.stringify(input), 20);
      expect(chunks.length).toBeGreaterThan(1);
      
      // Reconstruct the original JSON
      const reconstructed = chunks.reduce((acc, chunk) => ({
        ...acc,
        ...JSON.parse(chunk)
      }), {});
      
      expect(reconstructed).toEqual(input);
    });
  });

  describe('parseLLMOutputForSchema', () => {
    const schema = z.object({
      test: z.string()
    });

    it('should parse valid JSON output', async () => {
      const input = '```json\n{"test": "value"}\n```';
      const result = await parseLLMOutputForSchema(input, schema);
      expect(result).toEqual({ test: 'value' });
    });

    it('should repair and parse malformed JSON', async () => {
      const input = '```json\n{"test": "value",}\n```';
      const result = await parseLLMOutputForSchema(input, schema);
      expect(result).toEqual({ test: 'value' });
    });
  });
}); 