// Deterministic monochrome stone gradient + initials fallback for missing images.

const GRADIENTS: Array<[string, string]> = [
  ['#292524', '#1c1917'], // stone-800 → stone-900
  ['#44403c', '#292524'], // stone-700 → stone-800
  ['#57534e', '#44403c'], // stone-600 → stone-700
  ['#1c1917', '#0c0a09'], // stone-900 → stone-950
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getColorPair(name: string): [string, string] {
  const index = hashString(name) % GRADIENTS.length;
  return GRADIENTS[index];
}

/** Generates an SVG data URI with initials on a stone gradient background */
export function placeholderDataUri(name: string, size = 400): string {
  const initials = getInitials(name);
  const [c1, c2] = getColorPair(name);
  const fontSize = initials.length === 1 ? size * 0.42 : size * 0.34;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs>
    <rect width="${size}" height="${size}" fill="url(#g)"/>
    <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="rgba(255,255,255,0.85)" font-family="Inter,system-ui,-apple-system,sans-serif" font-weight="500" font-size="${fontSize}" letter-spacing="0.02em">${initials}</text>
  </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
