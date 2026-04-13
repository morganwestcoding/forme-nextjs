import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRateLimiter, getIP } from '@/app/libs/rateLimit';

describe('createRateLimiter', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('allows requests within the limit and returns allowed: true', () => {
    const limiter = createRateLimiter('test-allow', { limit: 5, windowSeconds: 60 });
    const result = limiter('user-1');
    expect(result.allowed).toBe(true);
    expect(result).toHaveProperty('remaining', 4);
  });

  it('decreases remaining count with each request', () => {
    const limiter = createRateLimiter('test-remaining', { limit: 5, windowSeconds: 60 });

    const r1 = limiter('user-2');
    expect(r1.allowed).toBe(true);
    expect(r1).toHaveProperty('remaining', 4);

    const r2 = limiter('user-2');
    expect(r2.allowed).toBe(true);
    expect(r2).toHaveProperty('remaining', 3);

    const r3 = limiter('user-2');
    expect(r3.allowed).toBe(true);
    expect(r3).toHaveProperty('remaining', 2);
  });

  it('returns allowed: false with retryAfterSeconds when limit is exceeded', () => {
    const limiter = createRateLimiter('test-exceed', { limit: 2, windowSeconds: 60 });

    limiter('user-3'); // 1
    limiter('user-3'); // 2
    const result = limiter('user-3'); // 3 - over limit

    expect(result.allowed).toBe(false);
    expect(result).toHaveProperty('retryAfterSeconds');
    expect((result as { allowed: false; retryAfterSeconds: number }).retryAfterSeconds).toBeGreaterThan(0);
    expect((result as { allowed: false; retryAfterSeconds: number }).retryAfterSeconds).toBeLessThanOrEqual(60);
  });

  it('resets after the window expires', () => {
    const limiter = createRateLimiter('test-reset', { limit: 1, windowSeconds: 10 });

    const r1 = limiter('user-4');
    expect(r1.allowed).toBe(true);

    const r2 = limiter('user-4');
    expect(r2.allowed).toBe(false);

    // Advance past the window
    vi.advanceTimersByTime(11_000);

    const r3 = limiter('user-4');
    expect(r3.allowed).toBe(true);
  });
});

describe('getIP', () => {
  it('extracts IP from x-forwarded-for header', () => {
    const request = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    });
    expect(getIP(request)).toBe('1.2.3.4');
  });

  it('extracts IP from x-real-ip header', () => {
    const request = new Request('http://localhost', {
      headers: { 'x-real-ip': '10.0.0.1' },
    });
    expect(getIP(request)).toBe('10.0.0.1');
  });

  it('returns "unknown" when no IP headers are present', () => {
    const request = new Request('http://localhost');
    expect(getIP(request)).toBe('unknown');
  });
});
