import { z } from 'zod';

/** Field rules reused by every form and request schema, so the portal and the API validate the same way. */
export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;
const PHONE_PATTERN = /^\+?[0-9][0-9\s-]{6,18}$/;

export const emailSchema = z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address'));

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `Use at least ${PASSWORD_MIN_LENGTH} characters`)
  .max(PASSWORD_MAX_LENGTH, `Use at most ${PASSWORD_MAX_LENGTH} characters`);

export const nameSchema = z.string().trim().min(2, 'Enter at least 2 characters').max(80, 'Use at most 80 characters');

/** Free text from a form. An empty field is an empty string; add `.default('')` where the field may be left out. */
export const textSchema = (max: number) => z.string().trim().max(max, `Use at most ${max} characters`);

/** A phone number, or an empty string for "none". */
export const phoneSchema = z
  .string()
  .trim()
  .refine((value) => value === '' || PHONE_PATTERN.test(value), 'Enter a valid phone number');

export const objectIdSchema = z.string().regex(/^[a-f0-9]{24}$/i, 'Invalid id');

/** One-time tokens from email links. */
export const tokenSchema = z.string().min(20, 'This link is invalid').max(200, 'This link is invalid');
