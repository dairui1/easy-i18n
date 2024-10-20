import consola from "consola";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { getConfig } from "@/config";
import { chunkJson, parseLLMOutputForSchema } from '../utils/json';
import { promptJsonTranslate } from './prompts';

const MAX_CHUNK_SIZE = 4096;

function getInputParams(targetLocale: string): { from: string; to: string; } {
  const from = 'English';
  let to = targetLocale;

  const localeMap: Record<string, string> = {
    br: 'Portuguese',
    cn: 'Simplify Chinese',
    de: 'German',
    es: 'Spanish',
    fr: 'French',
    id: 'Indonesian',
    it: 'Italian',
    jp: 'Japanese',
    kr: 'Korean',
    ru: 'Russian',
    tr: 'Turkish',
    tw: 'Traditional Chinese',
    vn: 'Vietnamese'
  };

  to = localeMap[targetLocale] || targetLocale;

  return { from, to };
}

export async function translateJSON(localeJSON: string, targetLocale: string): Promise<Record<string, any>> {
  try {
    const { from, to } = getInputParams(targetLocale);
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in the environment variables.');
    }

    const { llmConfig } = getConfig();

    const llm = new ChatOpenAI({
      model: llmConfig.model,
      temperature: llmConfig.temperature,
      maxRetries: llmConfig.maxRetries,
      topP: llmConfig.topP!,
      apiKey: process.env.OPENAI_API_KEY,
      configuration: {
        baseURL: process.env.OPENAI_API_HOST || 'https://api.openai.com/v1',
      },
    });

    const formattedChatPrompt = await promptJsonTranslate().formatPromptValue({ from, to, json: localeJSON });
    const res = await llm.invoke(formattedChatPrompt);
    const jsonText = typeof res.content === 'object'
      ? res.content.toString()
      : res.content;

    const parsedJson = await parseLLMOutputForSchema(jsonText, z.record(z.any()));

    if (!parsedJson) {
      throw new Error('No translation received from OpenAI');
    }

    return parsedJson;
  } catch (error) {
    console.error('Translate chunk JSON Error:', error);
    return {};
  }
}

export async function translateChunks(localeJSON: string, targetLocale: string): Promise<Record<string, any>> {
  const jsonArray = chunkJson(localeJSON, MAX_CHUNK_SIZE);
  const translatedChunks = await Promise.all(jsonArray.map(chunk => translateJSON(chunk, targetLocale)));
  return Object.assign({}, ...translatedChunks);
}
