/**
 * 同 JSON.parse，当传入可解析的 JSON 时返回 JSON 的解析结果
 *
 * 但当 JSON 解析失败时，用以下逻辑兜底：
 * - 没有 fallback 参数时直接返回 undefined
 * - fallback 为函数时，调用该函数，返回其返回的内容（fallback 函数抛错时 parseJson 也会抛错）
 * - 其它情况直接返回 fallback 作为兜底值
 *
 * 要注意的是，parseJson 不同于 JSON.parse，它默认返回 unknown 类型而非 any 类型
 *
 * @example
 * ```js
 * // 传入可解析的 JSON
 * parseJson("{}");                 // -> {}
 *
 * // 传入无效的 JSON 且没有 fallback
 * parseJson("");                   // -> undefined
 *
 * // 传入无效的 JSON 和 fallback 函数
 * parseJson("", () => "failed");   // -> failed
 *
 * // 传入无效的 JSON 和 fallback 值
 * parseJson("", -1);               // -> -1
 *
 * // 默认返回 unknown 类型
 * const a = parseJson("{}");       // a: unknown
 *
 * // 显式声明解析后的类型
 * const b = parseJson<T>("{}");    // b: T | undefined
 * const c = parseJson<any>("{}");  // c: any
 * ```
 */
export function parseJson<T>(json: string): T | undefined;
export function parseJson<T>(json: string, fallback: T | (() => T)): T;
export function parseJson(json: string, fallback?: any): any {
  try {
    return JSON.parse(json);
  } catch {
    if (typeof fallback === 'function') return fallback();
    return fallback;
  }
}

export function chunkJson(json: string, maxChunkSize: number): string[] {
  const jsonObject = JSON.parse(json);
  const chunks: string[] = [];

  function chunkObject(obj: Record<string, any>) {
    let chunk: Record<string, any> = {};
    let currentChunkSize = 0;

    const keys = Object.keys(obj);
    for (const key of keys) {
      const value = obj[key];
      const valueString = JSON.stringify(value);

      if (currentChunkSize + key.length + valueString.length + 5 > maxChunkSize) {
        chunks.push(JSON.stringify(chunk));
        chunk = {};
        currentChunkSize = 0;
      }

      chunk[key] = value;
      currentChunkSize += key.length + valueString.length + 5;
    }

    if (Object.keys(chunk).length > 0) {
      chunks.push(JSON.stringify(chunk));
    }
  }

  chunkObject(jsonObject);

  return chunks;
}