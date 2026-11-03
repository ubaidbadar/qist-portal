import { z } from 'zod';
import type { Branch } from './branches';
import type { Org } from './org';
import type { User } from './users';
import { emailSchema, nameSchema, PASSWORD_MAX_LENGTH, passwordSchema, tokenSchema } from './fields';

export const signupSchema = z.object({
  orgName: nameSchema,
  branchName: nameSchema,
  fullName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password').max(PASSWORD_MAX_LENGTH),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });
export const resetPasswordSchema = z.object({ token: tokenSchema, password: passwordSchema });
export const verifyEmailSchema = z.object({ token: tokenSchema });

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password').max(PASSWORD_MAX_LENGTH),
  newPassword: passwordSchema,
});

export type SignupInput = z.infer<typeof signupSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/** Who is signed in, their organization, and the active branches they can work in. */
export interface Me {
  user: User;
  org: Org;
  branches: Branch[];
}

/** Returned by signup, login, refresh and change-password. */
export interface Session extends Me {
  accessToken: string;
  refreshToken?: string;
}
