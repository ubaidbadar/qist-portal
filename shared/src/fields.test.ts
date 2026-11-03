import { describe, expect, test } from 'bun:test';
import { branchCreateSchema, branchUpdateSchema } from './branches';
import { emailSchema, passwordSchema, phoneSchema } from './fields';

describe('field rules', () => {
  test('emails are trimmed and lower-cased before validation', () => {
    expect(emailSchema.parse('  Ali.Khan@Example.COM ')).toBe('ali.khan@example.com');
    expect(emailSchema.safeParse('not-an-email').success).toBe(false);
  });

  test('passwords need 8 to 128 characters', () => {
    expect(passwordSchema.safeParse('1234567').success).toBe(false);
    expect(passwordSchema.safeParse('12345678').success).toBe(true);
    expect(passwordSchema.safeParse('x'.repeat(129)).success).toBe(false);
  });

  test('phone numbers may be empty but must look like a number when given', () => {
    expect(phoneSchema.parse('')).toBe('');
    expect(phoneSchema.parse('0300 1234567')).toBe('0300 1234567');
    expect(phoneSchema.parse('+92-42-35761234')).toBe('+92-42-35761234');
    expect(phoneSchema.safeParse('call me').success).toBe(false);
  });

  test('a branch update only contains the fields that were sent', () => {
    expect(branchUpdateSchema.parse({ name: 'Gulberg' })).toEqual({ name: 'Gulberg' });
    expect(branchCreateSchema.parse({ name: 'Gulberg' })).toEqual({ name: 'Gulberg', phone: '', address: '' });
  });
});
