import consola from 'consola';
import { parseJson } from '../utils/json';
import OpenAI from 'openai';
import { SomeZodObject, z } from 'zod';

let llmClient: OpenAI;

export function getLLMClient() {
  if (!llmClient) {
    llmClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_API_HOST,
    });
  }

  return llmClient;
}

/** 解析 json 格式的 LLM 输出，带 schema 校验 */
export async function parseResponse<T extends SomeZodObject>(rawResponse: string, schema: T): Promise<z.TypeOf<T>> {
  let jsonString = rawResponse;
  if (rawResponse.includes('```')) {
    const jsonRegex = /^[^]*?`{3}(?:json)?\n(.*[^]*?)\n`{3}[^]*?$/i;
    jsonString = jsonRegex.exec(rawResponse)?.[1] || '';
  }

  try {
    const jsonObject = schema.parse(JSON.parse(jsonString));
    return jsonObject;
  } catch (e) {
    throw new Error(`LLMParseError: ${e} - jsonString:${jsonString}`);
  }
}

/** 解析 json array */
export async function parseArrayResponse(rawResponse: string) {
  let jsonString = rawResponse;
  if (rawResponse.includes('```')) {
    const jsonRegex = /^[^]*?`{3}(?:json)?\n(.*[^]*?)\n`{3}[^]*?$/i;
    jsonString = jsonRegex.exec(rawResponse)?.[1] || '';
  }

  try {
    const jsonObject = z.string().array()
      .parse(parseJson(jsonString));
    return jsonObject;
  } catch (e) {
    consola.error('LLMParseError - received', jsonString);
    throw new Error(`LLMParseError: ${e}`);
  }
}

/** 解析 ``` 包裹的代码段 */
export async function parseCodeResponse(rawResponse: string) {
  if (rawResponse.includes('```')) {
    const codeRegex = /^`{3}.*[\n\r]([^]*?^)`{3}/m;
    return codeRegex.exec(rawResponse)?.[1] || '';
  }

  return rawResponse;
}

/**
 * 封装了 OpenAI 的 chat.completions.create 方法，增加了回复验证功能
 *
 * @template T - 验证类型：'json' | 'array' | 'code' | 'text'
 * @template S - Zod schema 类型
 *
 * @param {Object} params - 函数参数
 * @param {Object} [params.validation] - 回复验证选项
 * @param {OpenAI.RequestOptions} [options] - OpenAI 请求选项
 *
 * @returns {Promise<T extends 'json' ? z.infer<S> : T extends 'array' ? string[] : string>}
 * 根据验证类型返回相应的结果：
 * - 'json': 返回经过 Zod schema 验证的 JSON 对象
 * - 'array': 返回字符串数组
 * - 'code' 或 'text': 返回字符串
 *
 * @throws {Error} 当 LLM 返回空结果或解析失败时抛出错误
 *
 * @example
 * // JSON 验证示例
 * const result = await createChatCompletions({
 *   model: 'openai/gpt-4o-mini',
 *   messages: [{ role: 'user', content: 'Generate a JSON object with name and age' }],
 *   validation: {
 *     type: 'json',
 *     schema: z.object({ name: z.string(), age: z.number() })
 *   }
 * });
 * console.log(result); // { name: 'John Doe', age: 30 }
 */
export async function createChatCompletions<
  T extends 'json' | 'array' | 'code' | 'text' = 'text',
  S extends T extends 'json' ? SomeZodObject : never = never
>(
  params: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming & {
    validation?: T extends 'json'
      ? {
        type: 'json';
        schema: S;
      }
      : T extends 'array' | 'code'
        ? {
          type: T;
        }
        : T extends 'text'
          ? {
            type?: T;
          }
          : never;
  },
  options?: OpenAI.RequestOptions,
): Promise<
  T extends 'json'
    ? z.infer<S>
    : T extends 'array'
      ? string[]
      : T extends 'code' | 'text'
        ? string
        : never
  > {
  const { validation, ...body } = params;

  try {
    const chatCompletion = await getLLMClient().chat.completions.create(body, options);

    const llmResult = chatCompletion.choices?.[0]?.message?.content;
    if (!llmResult) {
      throw new Error('LLMError: empty result');
    }

    if (validation?.type === 'json' && validation.schema) {
      return await parseResponse(llmResult, validation.schema) as any;
    }

    if (validation?.type === 'array') {
      return await parseArrayResponse(llmResult) as any;
    }

    if (validation?.type === 'code') {
      return await parseCodeResponse(llmResult) as any;
    }

    return llmResult as any;
  } catch (e: any) {
    throw e;
  }
}
