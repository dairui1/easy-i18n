import { writeFile, readFile, readDir } from '../../utils/file';
import fs from 'fs/promises';

jest.mock('fs/promises');

describe('File Utils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should write file correctly', async () => {
    const mockMkdir = jest.spyOn(fs, 'mkdir');
    const mockWriteFile = jest.spyOn(fs, 'writeFile');

    await writeFile('test/file.json', '{"test": "data"}');

    expect(mockMkdir).toHaveBeenCalledWith(expect.any(String), { recursive: true });
    expect(mockWriteFile).toHaveBeenCalledWith('test/file.json', '{"test": "data"}');
  });

  it('should read file correctly', async () => {
    const mockContent = '{"test": "data"}';
    (fs.readFile as jest.Mock).mockResolvedValue(mockContent);

    const result = await readFile('test/file.json');
    expect(result).toBe(mockContent);
  });

  it('should read directory correctly', async () => {
    const mockFiles = ['file1.json', 'file2.json'];
    (fs.readdir as jest.Mock).mockResolvedValue(mockFiles);

    const result = await readDir('test');
    expect(result).toEqual(mockFiles);
  });
}); 