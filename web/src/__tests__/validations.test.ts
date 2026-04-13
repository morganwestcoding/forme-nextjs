import { describe, it, expect } from 'vitest';
import {
  validateBody,
  registerSchema,
  createPostSchema,
  createMessageSchema,
  createReviewSchema,
} from '@/app/utils/validations';
import { z } from 'zod';

describe('validateBody', () => {
  const testSchema = z.object({
    name: z.string().min(1),
    age: z.number().positive(),
  });

  it('returns { success: true, data } for valid data', () => {
    const result = validateBody(testSchema, { name: 'Alice', age: 30 });
    expect(result).toEqual({ success: true, data: { name: 'Alice', age: 30 } });
  });

  it('returns { success: false, error } for invalid data', () => {
    const result = validateBody(testSchema, { name: '', age: -1 });
    expect(result.success).toBe(false);
    expect(result).toHaveProperty('error');
    expect(typeof (result as { success: false; error: string }).error).toBe('string');
  });
});

describe('registerSchema', () => {
  const validRegistration = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  };

  it('accepts valid registration data', () => {
    const result = registerSchema.safeParse(validRegistration);
    expect(result.success).toBe(true);
  });

  it('rejects missing email', () => {
    const result = registerSchema.safeParse({
      name: 'Test User',
      password: 'password123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short password (less than 6 characters)', () => {
    const result = registerSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      password: '12345',
    });
    expect(result.success).toBe(false);
  });
});

describe('createPostSchema', () => {
  it('accepts valid post data', () => {
    const result = createPostSchema.safeParse({
      content: 'Hello world!',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty content', () => {
    const result = createPostSchema.safeParse({
      content: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('createMessageSchema', () => {
  it('requires either conversationId or recipientId', () => {
    const result = createMessageSchema.safeParse({
      content: 'Hello',
    });
    expect(result.success).toBe(false);
  });

  it('accepts with conversationId', () => {
    const result = createMessageSchema.safeParse({
      conversationId: 'conv-1',
      content: 'Hello',
    });
    expect(result.success).toBe(true);
  });

  it('accepts with recipientId', () => {
    const result = createMessageSchema.safeParse({
      recipientId: 'user-1',
      content: 'Hello',
    });
    expect(result.success).toBe(true);
  });
});

describe('createReviewSchema', () => {
  it('requires either targetUserId or targetListingId', () => {
    const result = createReviewSchema.safeParse({
      rating: 5,
      comment: 'Great service!',
    });
    expect(result.success).toBe(false);
  });

  it('accepts with targetUserId', () => {
    const result = createReviewSchema.safeParse({
      rating: 5,
      comment: 'Great service!',
      targetUserId: 'user-1',
    });
    expect(result.success).toBe(true);
  });

  it('accepts with targetListingId', () => {
    const result = createReviewSchema.safeParse({
      rating: 4,
      comment: 'Nice place!',
      targetListingId: 'listing-1',
    });
    expect(result.success).toBe(true);
  });
});
