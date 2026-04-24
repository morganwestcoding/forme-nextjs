/**
 * Strip all HTML tags from user input, returning plain text.
 * Use for fields like names, titles, bios, and messages.
 *
 * Does not pull in JSDOM / DOMPurify — those pull html-encoding-sniffer which
 * hit an ERR_REQUIRE_ESM on @exodus/bytes in Node runtime on Vercel.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
}

/**
 * Sanitize an object's string fields in-place.
 * Only processes top-level string values.
 */
export function sanitizeFields<T extends Record<string, unknown>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj };
  for (const field of fields) {
    if (typeof result[field] === 'string') {
      (result as Record<string, unknown>)[field as string] = sanitizeText(result[field] as string);
    }
  }
  return result;
}
