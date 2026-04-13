import DOMPurify from 'isomorphic-dompurify';

/**
 * Strip all HTML tags from user input, returning plain text.
 * Use for fields like names, titles, bios, and messages.
 */
export function sanitizeText(input: string): string {
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }).trim();
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
