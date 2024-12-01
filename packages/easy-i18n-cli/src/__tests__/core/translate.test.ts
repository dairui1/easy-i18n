import { translateChunks } from '../../core/translate';
import dotenv from 'dotenv';

dotenv.config();

describe('Translation Core', () => {
  it('should translate JSON correctly', async () => {
    const input = JSON.stringify({
      greeting: 'hello',
      farewell: 'goodbye'
    });

    const result = await translateChunks(input, 'cn');
    
    expect(result).toEqual({
      greeting: '你好',
      farewell: '再见'
    });
  }, 30000); // 30 second timeout
}); 