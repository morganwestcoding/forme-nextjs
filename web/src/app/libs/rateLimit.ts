/**
 * In-memory rate limiter for API routes.
 *
 * Each limiter tracks requests by a caller-supplied key (usually IP or email).
 * Entries auto-expire so memory stays bounded.
 *
 * For multi-instance deployments, swap this for an Upstash Redis limiter.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number; // epoch ms
}

interface RateLimiterOptions {
  /** Maximum requests allowed within the window. */
  limit: number;
  /** Window duration in seconds. */
  windowSeconds: number;
}

const stores = new Map<string, Map<string, RateLimitEntry>>();

// Periodic cleanup every 60 s so stale entries don't accumulate.
let cleanupScheduled = false;
function scheduleCleanup() {
  if (cleanupScheduled) return;
  cleanupScheduled = true;
  setInterval(() => {
    const now = Date.now();
    stores.forEach((store) => {
      store.forEach((entry, key) => {
        if (now >= entry.resetAt) store.delete(key);
      });
    });
  }, 60_000).unref();
}

export function createRateLimiter(name: string, opts: RateLimiterOptions) {
  const store = new Map<string, RateLimitEntry>();
  stores.set(name, store);
  scheduleCleanup();

  /**
   * Check whether `key` is within the rate limit.
   * Returns `{ allowed: true, remaining }` or `{ allowed: false, retryAfterSeconds }`.
   */
  return function check(key: string) {
    const now = Date.now();
    const entry = store.get(key);

    // First request or window expired — start fresh.
    if (!entry || now >= entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + opts.windowSeconds * 1000 });
      return { allowed: true as const, remaining: opts.limit - 1 };
    }

    // Within window — increment.
    entry.count += 1;
    if (entry.count <= opts.limit) {
      return { allowed: true as const, remaining: opts.limit - entry.count };
    }

    // Over limit.
    const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false as const, retryAfterSeconds };
  };
}

/**
 * Extract a best-effort IP from a Request (works behind most proxies).
 */
export function getIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
