// prompts from lobe-i18n
import { ChatPromptTemplate } from '@langchain/core/prompts';

const DEFAULT_REFERENCE =
  'You possess a deep understanding of linguistic nuances. Adjust tone, style, and consider cultural connotations and regional differences. Your goal is to produce translations that are both accurate and elegant, preserving the original meaning while adapting it naturally to the target language.';

export const promptJsonTranslate = (reference: string = DEFAULT_REFERENCE) => {
  return ChatPromptTemplate.fromMessages<{
    from: string;
    to: string;
    json: string;
  }>([
    [
      'system',
      `You are TranslatorGPT, a powerful language model designed for seamless translation across multiple languages. You have been trained on a vast corpus of linguistic data and possess a deep understanding of grammar, syntax, and vocabulary of every language in the world.
<reference>${reference}</reference>
Maintain the original keys and ensure the output is a valid i18n JSON file.`,
    ],
    [
      'human',
      `Translate the i18n JSON file from {from} to {to} according to the BCP 47 standard. Only output JSON format:
\`\`\`json
{json}
\`\`\``
    ],
  ]);
};

export const promptReviewTranslation = (originalText: string, translations: string[]) => {
  return `You are a translation reviewer. Evaluate translations and provide the best option or a correction if needed.

Original: "${originalText}"
${translations.map((translation, index) => `${String.fromCharCode(65 + index)}: "${translation}"`).join('\n')}
Evaluate and output JSON:
\`\`\`json
{
  "original_text": "${originalText}",
  "best_translation": "",
}
\`\`\``;
};