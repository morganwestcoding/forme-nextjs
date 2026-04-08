// Deterministic color + initials fallback for missing images.
// Generates a consistent, aesthetically pleasing color from a name string.

const COLORS = [
  ['#f0abfc', '#a855f7'], // pink → purple
  ['#93c5fd', '#3b82f6'], // light blue → blue
  ['#6ee7b7', '#10b981'], // mint → emerald
  ['#fcd34d', '#f59e0b'], // yellow → amber
  ['#fca5a5', '#ef4444'], // rose → red
  ['#a5b4fc', '#6366f1'], // lavender → indigo
  ['#67e8f9', '#06b6d4'], // cyan → cyan
  ['#fdba74', '#f97316'], // peach → orange
  ['#86efac', '#22c55e'], // green light → green
  ['#c4b5fd', '#8b5cf6'], // violet light → violet
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
  const index = hashString(name) % COLORS.length;
  return COLORS[index] as [string, string];
}

/** Generates an SVG data URI with initials on a gradient background */
export function placeholderDataUri(name: string, size = 400): string {
  const initials = getInitials(name);
  const [c1, c2] = getColorPair(name);
  const fontSize = initials.length === 1 ? size * 0.45 : size * 0.36;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs>
    <rect width="${size}" height="${size}" fill="url(#g)"/>
    <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="white" font-family="system-ui,-apple-system,sans-serif" font-weight="600" font-size="${fontSize}" letter-spacing="1">${initials}</text>
  </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
