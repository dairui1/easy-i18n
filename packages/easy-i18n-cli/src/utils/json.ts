import consola from 'consola';
import { jsonrepair } from 'jsonrepair';
import { z, ZodSchema } from 'zod';

export function chunkJson(json: string, maxChunkSize: number): string[] {
  const jsonObject = JSON.parse(json);
  const chunks: string[] = [];
  let chunk: Record<string, any> = {};
  let currentChunkSize = 0;

  for (const [key, value] of Object.entries(jsonObject)) {
    const valueString = JSON.stringify(value);
    const entrySize = key.length + valueString.length + 5; // 5 accounts for quotes and colon

    if (currentChunkSize + entrySize > maxChunkSize && Object.keys(chunk).length > 0) {
      chunks.push(JSON.stringify(chunk));
      chunk = {};
      currentChunkSize = 0;
    }

    chunk[key] = value;
    currentChunkSize += entrySize;
  }

  if (Object.keys(chunk).length > 0) {
    chunks.push(JSON.stringify(chunk));
  }

  return chunks;
}

export const parseLLMOutputForSchema = async <T extends ZodSchema>(
  llmOutput: string,
  schema: T,
): Promise<z.infer<T>> => {
  try {
    // Check if the AI output contains code block delimiters (```) and extract the JSON part if present
    let json = llmOutput.includes('```')
      ? llmOutput.trim().split(/```(?:json)?/)[1] // Extracts the content between the code block delimiters
      : llmOutput.trim(); // Use the entire output as is if no delimiters are found

    if (!json) {
      throw new Error('No JSON found in the AI output.');
    }

    try {
      // Attempt to parse the JSON to check if it's valid
      JSON.parse(json);
    } catch (error) {
      // Log the error if JSON parsing fails
      consola.log('Found invalid json, attempting to repair with jsonrepair...',);

      // Attempt to repair the JSON using the jsonrepair library
      json = jsonrepair(json);
    }

    // Parse the (potentially repaired) JSON using the provided Zod schema
    return schema.parseAsync(JSON.parse(json));
  } catch (e) {
    throw new Error(`Structured output parse failed. aiOutput: "${llmOutput}". Error: ${e}`);
  }
};
