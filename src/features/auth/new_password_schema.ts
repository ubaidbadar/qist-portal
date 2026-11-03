import { z } from 'zod';
import { passwordSchema } from '@shop/shared';

/** The new password typed twice. The API only receives the first one. */
export const newPasswordFields = {
  password: passwordSchema,
  confirmPassword: z.string(),
};

export const passwordsMatch = (value: { password: string; confirmPassword: string }) => value.password === value.confirmPassword;
export const MISMATCH = { message: "The passwords don't match", path: ['confirmPassword'] };
