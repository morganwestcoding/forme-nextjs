// Common surname particles that should stay lowercase when they appear
// mid-name (e.g., "Ludwig van Beethoven", "Charles de Gaulle"). Keep this
// list conservative — adding too many entries lowercases legitimate
// non-particle surnames that happen to share spelling.
const SURNAME_PARTICLES = new Set([
  'de', 'da', 'do', 'du', 'di', 'del', 'della', 'dei',
  'la', 'le', 'las', 'los',
  'van', 'von', 'der', 'den', 'des', 'dem',
  'el', 'al', 'bin', 'ibn', 'y',
  'te', 'ten', 'ter', 'af', 'of',
]);

// Normalizes a human name to title case:
//   - collapses runs of whitespace
//   - trims
//   - lowercases everything, then capitalizes the first letter of each
//     word and each sub-segment after a hyphen or apostrophe
//   - keeps known surname particles ("van", "de", "der", ...) lowercase
//     when they aren't the first word — so "ludwig van beethoven" →
//     "Ludwig van Beethoven", but "van trapp" → "Van Trapp"
//
// Examples:
//   "Vic SmitH"          → "Vic Smith"
//   "VIC SMITH"          → "Vic Smith"
//   "smith-jones"        → "Smith-Jones"
//   "o'brien"            → "O'Brien"
//   "de la cruz"         → "De la Cruz"
//   "  john   doe  "     → "John Doe"
export function titleCaseName(raw: string): string {
  if (!raw) return '';
  const cleaned = raw.replace(/\s+/g, ' ').trim();
  if (!cleaned) return '';

  return cleaned
    .split(' ')
    .map((word, idx) => {
      const lower = word.toLowerCase();
      if (idx > 0 && SURNAME_PARTICLES.has(lower)) {
        return lower;
      }
      return lower.replace(/(^|['-])(\p{L})/gu, (_, sep, ch) => sep + ch.toUpperCase());
    })
    .join(' ');
}
