/**
 * Environment variable validation.
 * Import this in layout.tsx (server component) to fail fast on missing vars.
 */

const required = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
] as const;

const requiredForPayments = [
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
] as const;

const requiredForEmail = [
  'EMAIL_USER',
  'EMAIL_APP_PASSWORD',
] as const;

const optional = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GITHUB_ID',
  'GITHUB_SECRET',
  'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME',
  'NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN',
  'NEXT_PUBLIC_APP_URL',
  'EMAIL_FROM',
] as const;

export function validateEnv() {
  const missing: string[] = [];

  for (const key of required) {
    if (!process.env[key]) missing.push(key);
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n  ${missing.join('\n  ')}\n\nSee .env.example for reference.`
    );
  }

  // Warn about optional but important vars
  const warnings: string[] = [];

  for (const key of requiredForPayments) {
    if (!process.env[key]) warnings.push(`${key} (payments will not work)`);
  }

  for (const key of requiredForEmail) {
    if (!process.env[key]) warnings.push(`${key} (email sending will not work)`);
  }

  if (warnings.length > 0 && process.env.NODE_ENV !== 'test') {
    console.warn(
      `⚠ Missing optional environment variables:\n  ${warnings.join('\n  ')}`
    );
  }
}
