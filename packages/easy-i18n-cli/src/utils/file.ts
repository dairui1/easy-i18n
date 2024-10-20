import fs from 'fs/promises';
import path from 'path';

export async function writeFile(filePath: string, data: string): Promise<void> {
  const dirPath = path.dirname(filePath);
  await fs.mkdir(dirPath, { recursive: true });
  await fs.writeFile(filePath, data);
}

export async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf8');
}

export async function readDir(dirPath: string): Promise<string[]> {
  return fs.readdir(dirPath);
}