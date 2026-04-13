import { describe, it, expect } from 'vitest';
import { sanitizeText, sanitizeFields } from '@/app/utils/sanitize';

describe('sanitizeText', () => {
  it('strips HTML tags', () => {
    expect(sanitizeText('<b>bold</b> text')).toBe('bold text');
  });

  it('strips script tags and their content', () => {
    expect(sanitizeText('<script>alert("xss")</script>hello')).toBe('hello');
  });

  it('preserves plain text', () => {
    expect(sanitizeText('just plain text')).toBe('just plain text');
  });

  it('trims whitespace', () => {
    expect(sanitizeText('  hello world  ')).toBe('hello world');
  });
});

describe('sanitizeFields', () => {
  it('sanitizes specified fields on an object', () => {
    const obj = { name: '<b>Alice</b>', bio: '<script>xss</script>Hi' };
    const result = sanitizeFields(obj, ['name', 'bio']);
    expect(result.name).toBe('Alice');
    expect(result.bio).toBe('Hi');
  });

  it('leaves non-specified fields untouched', () => {
    const obj = { name: '<b>Alice</b>', age: 30, html: '<i>italic</i>' };
    const result = sanitizeFields(obj, ['name']);
    expect(result.name).toBe('Alice');
    expect(result.age).toBe(30);
    expect(result.html).toBe('<i>italic</i>');
  });
});
