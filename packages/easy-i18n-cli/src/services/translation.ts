import { createChatCompletions } from './llm-request';
import { chunkJson } from '../utils/json';

const maxChunkSize = 8192;

function getInputParams(targetLocale: string): { from: string; to: string; model: string } {
  const model = 'anthropic/claude-3.5-sonnet:beta';
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

  return { from, to, model };
}

export async function translateJSON(localeJSON: string, targetLocale: string): Promise<Record<string, any>> {
  try {
    const { from, to, model } = getInputParams(targetLocale);

    const llmResult = await createChatCompletions({
      model: model,
      temperature: 0.3,
      messages: [{
        role: 'system',
        content: `You are TranslatorGPT, a powerful language model designed for seamless translation of text across multiple languages.
You have been trained on a vast corpus of linguistic data and possess a deep understanding of grammar, syntax, and vocabulary of every language in the world.
You excel at generating structured data in JSON format and follow this rules: 
1. you never translate the key, you always use the double quotes to surround key and value.
2. you always escape single quotes and backslashes contained in the value
3. you never write a comma at the end of the last row in the file.
          `,
      }, {
        role: 'user',
        content: `Translate the following JSON from ${from} to ${to}. Only output JSON format:
\`\`\`json
${localeJSON}
\`\`\`
`,
      }],
      response_format: { type: "json_object" },
      validation: { type: "code" }
    });

    const jsonText = llmResult.replace(/\${(\w+)}/g, '{{$1}}'); // 还原 ${var} 为 {{var}}

    if (!jsonText) {
      throw new Error('No translation received from OpenAI');
    }

    const chunkResult = JSON.parse(jsonText);

    return chunkResult;
  } catch (error) {
    console.error('Translate chunk JSON Error:', error);
    return {};
  }
}

export async function translateChunks(localeJSON: string, targetLocale: string): Promise<Record<string, any>> {
  const jsonArray = chunkJson(localeJSON, maxChunkSize);
  const translatedChunks = await Promise.all(jsonArray.map(chunk => translateJSON(chunk, targetLocale)));
  return Object.assign({}, ...translatedChunks);
}