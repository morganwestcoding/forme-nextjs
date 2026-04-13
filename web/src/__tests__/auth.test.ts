import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '@/app/libs/prismadb';
import bcrypt from 'bcryptjs';

vi.mock('bcryptjs', () => ({
  default: { compare: vi.fn(), hash: vi.fn() },
}));

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({ sendMail: vi.fn().mockResolvedValue({}) })),
  },
}));

vi.mock('@/app/utils/mobileAuth', () => ({
  signMobileToken: vi.fn().mockResolvedValue('mock-jwt-token'),
  getUserFromRequest: vi.fn().mockResolvedValue(null),
}));

const mockedPrisma = vi.mocked(prisma);
const mockedBcrypt = vi.mocked(bcrypt);

function createRequest(url: string, options?: RequestInit) {
  return new Request(`http://localhost:3000${url}`, {
    headers: {
      'x-forwarded-for': '127.0.0.1',
      'Content-Type': 'application/json',
    },
    ...options,
  });
}

function createRequestWithIP(url: string, ip: string, options?: RequestInit) {
  return new Request(`http://localhost:3000${url}`, {
    headers: {
      'x-forwarded-for': ip,
      'Content-Type': 'application/json',
    },
    ...options,
  });
}

// ─── Login Route ────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  let POST: (request: Request) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Re-import to get a fresh module with fresh rate limiter state is tricky,
    // so we use unique IPs per test to avoid rate limit collisions.
    const mod = await import('@/app/api/auth/login/route');
    POST = mod.POST;
  });

  it('returns 400 if email is missing', async () => {
    const req = createRequestWithIP('/api/auth/login', '10.0.0.1', {
      method: 'POST',
      body: JSON.stringify({ password: 'password123' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toBe('Email and password are required');
  });

  it('returns 400 if password is missing', async () => {
    const req = createRequestWithIP('/api/auth/login', '10.0.0.2', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toBe('Email and password are required');
  });

  it('returns 401 if user not found', async () => {
    mockedPrisma.user.findUnique.mockResolvedValueOnce(null);

    const req = createRequestWithIP('/api/auth/login', '10.0.0.3', {
      method: 'POST',
      body: JSON.stringify({ email: 'noone@example.com', password: 'password123' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json.error).toBe('Invalid credentials');
  });

  it('returns 401 if password does not match', async () => {
    const fakeUser = {
      id: 'user-1',
      email: 'test@example.com',
      hashedPassword: '$2a$12$hashedpassword',
      name: 'Test User',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      emailVerified: null,
    };

    mockedPrisma.user.findUnique.mockResolvedValueOnce(fakeUser as any);
    mockedBcrypt.compare.mockResolvedValueOnce(false as never);

    const req = createRequestWithIP('/api/auth/login', '10.0.0.4', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'wrongpassword' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json.error).toBe('Invalid credentials');
  });

  it('returns 200 with user data on successful login', async () => {
    const fakeUser = {
      id: 'user-1',
      email: 'test@example.com',
      hashedPassword: '$2a$12$hashedpassword',
      name: 'Test User',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      emailVerified: null,
    };

    mockedPrisma.user.findUnique.mockResolvedValueOnce(fakeUser as any);
    mockedBcrypt.compare.mockResolvedValueOnce(true as never);

    const req = createRequestWithIP('/api/auth/login', '10.0.0.5', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'correctpassword' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.token).toBe('mock-jwt-token');
    expect(json.user.email).toBe('test@example.com');
    expect(json.user.hashedPassword).toBeUndefined();
    expect(json.user.createdAt).toBe('2025-01-01T00:00:00.000Z');
    expect(json.user.updatedAt).toBe('2025-01-01T00:00:00.000Z');
    expect(json.user.emailVerified).toBeNull();
  });

  it('rate limits after 5 attempts from the same IP', async () => {
    const ip = '10.0.0.99';

    // Use missing fields so we get quick 400s without DB calls
    for (let i = 0; i < 5; i++) {
      const req = createRequestWithIP('/api/auth/login', ip, {
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'pass' }),
      });
      // Need the user lookup to succeed or fail for each attempt
      mockedPrisma.user.findUnique.mockResolvedValueOnce(null);
      await POST(req);
    }

    // 6th attempt should be rate limited
    const req = createRequestWithIP('/api/auth/login', ip, {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'pass' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(429);

    const json = await res.json();
    expect(json.error).toMatch(/Too many login attempts/);
  });
});

// ─── Register Route ─────────────────────────────────────────────────────────

describe('POST /api/register', () => {
  let POST: (request: Request) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('@/app/api/register/route');
    POST = mod.POST;
  });

  it('returns 400 for missing name', async () => {
    const req = createRequestWithIP('/api/register', '10.1.0.1', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing email', async () => {
    const req = createRequestWithIP('/api/register', '10.1.0.2', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test', password: 'password123' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing password', async () => {
    const req = createRequestWithIP('/api/register', '10.1.0.3', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test', email: 'test@example.com' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 for password that is too short', async () => {
    const req = createRequestWithIP('/api/register', '10.1.0.4', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test', email: 'test@example.com', password: '123' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toMatch(/6 characters/);
  });

  it('returns 409 if email already exists', async () => {
    mockedPrisma.user.findUnique.mockResolvedValueOnce({ id: 'existing-user' } as any);

    const req = createRequestWithIP('/api/register', '10.1.0.5', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'existing@example.com',
        password: 'password123',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(409);

    const json = await res.json();
    expect(json.error).toBe('Email already exists');
  });

  it('returns 200 on successful registration', async () => {
    mockedPrisma.user.findUnique.mockResolvedValueOnce(null); // no existing user

    const createdUser = {
      id: 'new-user-1',
      email: 'newuser@example.com',
      name: 'New User',
      hashedPassword: '$2a$12$hashedpassword',
      createdAt: new Date('2025-06-01'),
      updatedAt: new Date('2025-06-01'),
      emailVerified: null,
      location: '',
      bio: '',
      image: '',
      imageSrc: '',
      backgroundImage: '',
      subscriptionTier: 'bronze (customer)',
      isSubscribed: false,
      managedListings: [],
      userType: null,
      academyId: null,
      verificationStatus: 'none',
      verifiedAt: null,
    };

    mockedPrisma.user.create.mockResolvedValueOnce(createdUser as any);
    mockedBcrypt.hash.mockResolvedValueOnce('$2a$12$hashedpassword' as never);

    const req = createRequestWithIP('/api/register', '10.1.0.6', {
      method: 'POST',
      body: JSON.stringify({
        name: 'New User',
        email: 'newuser@example.com',
        password: 'password123',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.token).toBe('mock-jwt-token');
    expect(json.user.email).toBe('newuser@example.com');
    expect(json.user.name).toBe('New User');
    expect(json.user.hashedPassword).toBeUndefined();
    expect(json.user.userType).toBe('customer');
  });
});

// ─── Check-email Route ──────────────────────────────────────────────────────

describe('GET /api/check-email', () => {
  let GET: (request: Request) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('@/app/api/check-email/route');
    GET = mod.GET;
  });

  it('returns 400 if email param is missing', async () => {
    const req = createRequestWithIP('/api/check-email', '10.2.0.1', {
      method: 'GET',
    });

    const res = await GET(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toBe('Email is required');
  });

  it('returns { exists: true } when user exists', async () => {
    mockedPrisma.user.findUnique.mockResolvedValueOnce({ id: 'user-1' } as any);

    const req = createRequestWithIP('/api/check-email?email=test@example.com', '10.2.0.2', {
      method: 'GET',
    });

    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.exists).toBe(true);
  });

  it('returns { exists: false } when user does not exist', async () => {
    mockedPrisma.user.findUnique.mockResolvedValueOnce(null);

    const req = createRequestWithIP('/api/check-email?email=nobody@example.com', '10.2.0.3', {
      method: 'GET',
    });

    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.exists).toBe(false);
  });
});

// ─── Forgot-password Route ──────────────────────────────────────────────────

describe('POST /api/auth/forgot-password', () => {
  let POST: (request: Request) => Promise<Response>;

  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await import('@/app/api/auth/forgot-password/route');
    POST = mod.POST;
  });

  it('returns 404 when email does not exist (no user found)', async () => {
    mockedPrisma.user.findUnique.mockResolvedValueOnce(null);

    const req = createRequestWithIP('/api/auth/forgot-password', '10.3.0.1', {
      method: 'POST',
      body: JSON.stringify({ email: 'ghost@example.com' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(404);

    const json = await res.json();
    expect(json.error).toBe('No user found with this email');
  });

  it('returns 200 when email exists and sends reset email', async () => {
    const fakeUser = {
      id: 'user-1',
      email: 'real@example.com',
      name: 'Real User',
      hashedPassword: '$2a$12$hash',
    };

    mockedPrisma.user.findUnique.mockResolvedValueOnce(fakeUser as any);
    mockedPrisma.user.update.mockResolvedValueOnce(fakeUser as any);

    const req = createRequestWithIP('/api/auth/forgot-password', '10.3.0.2', {
      method: 'POST',
      body: JSON.stringify({ email: 'real@example.com' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.message).toBe('Reset email sent successfully');

    // Verify the user update was called with reset token data
    expect(mockedPrisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { email: 'real@example.com' },
        data: expect.objectContaining({
          resetToken: expect.any(String),
          resetTokenExpiry: expect.any(Date),
        }),
      })
    );
  });
});
