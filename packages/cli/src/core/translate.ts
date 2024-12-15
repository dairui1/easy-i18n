import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import { getConfig } from "@/config";
import { chunkJson, parseLLMOutputForSchema } from '../utils/json';
import { promptJsonTranslate } from './prompts';
import consola from 'consola';

/**
 * Maximum size of a JSON chunk for translation.
 * This value is estimated based on my experience.
 * It represents a balance between processing efficiency and API limitations.
 * Larger chunks might lead to API errors, while smaller chunks could increase
 * the number of API calls and overall processing time.
 */
const MAX_CHUNK_SIZE = 8000;

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
    vn: 'Vietnamese',
    ar: 'Arabic',
    hi: 'Hindi',
    th: 'Thai',
    pl: 'Polish',
    nl: 'Dutch',
    sv: 'Swedish',
    da: 'Danish',
    fi: 'Finnish',
    no: 'Norwegian',
    hu: 'Hungarian',
    cs: 'Czech',
    el: 'Greek',
    he: 'Hebrew',
    ro: 'Romanian',
    uk: 'Ukrainian',
    bg: 'Bulgarian',
    pt: 'Portuguese',
    ms: 'Malay',
    bn: 'Bengali',
    fa: 'Persian',
    ur: 'Urdu',
    vi: 'Vietnamese',
    tl: 'Tagalog',
    sk: 'Slovak',
    lt: 'Lithuanian',
    lv: 'Latvian',
    et: 'Estonian',
    sr: 'Serbian',
    hr: 'Croatian',
    sl: 'Slovenian',
    mk: 'Macedonian',
    sq: 'Albanian',
    ka: 'Georgian',
    hy: 'Armenian',
    az: 'Azerbaijani',
    kk: 'Kazakh',
    uz: 'Uzbek',
    mn: 'Mongolian'
  };

  to = localeMap[targetLocale] || targetLocale;

  return { from, to };
}

export async function translateChunks(localeJSON: string, targetLocale: string): Promise<Record<string, any>> {
  try {
    const { from, to } = getInputParams(targetLocale);
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in the environment variables.');
    }

    const { llmConfig } = getConfig();

    consola.info(`Initializing ChatOpenAI with model: ${llmConfig.model}`);
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

    const jsonArray = chunkJson(localeJSON, MAX_CHUNK_SIZE);
    consola.info(`Splitting JSON into ${jsonArray.length} chunks for translation`);

    const translatedChunks = await Promise.all(jsonArray.map(async (chunk, index) => {
      consola.start(`Translating chunk ${index + 1}/${jsonArray.length} from ${from} to ${to}`);
      const formattedChatPrompt = await promptJsonTranslate().formatPromptValue({ from, to, json: chunk });
      const res = await llm.invoke(formattedChatPrompt);
      consola.success(`Chunk ${index + 1}/${jsonArray.length} translated successfully`);

      const jsonText = typeof res.content === 'object'
        ? res.content.toString()
        : res.content;

      const parsedJson = await parseLLMOutputForSchema(jsonText, z.record(z.any()));

      if (!parsedJson) {
        throw new Error('No translation received from OpenAI');
      }

      return parsedJson;
    }));

    consola.success(`All ${jsonArray.length} chunks translated successfully`);
    return Object.assign({}, ...translatedChunks);
  } catch (error) {
    consola.error('Translate chunks JSON Error:', error);
    return {};
  }
}
