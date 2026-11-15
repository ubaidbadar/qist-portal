import { z } from 'zod';
import type { Branch } from './branches';
import type { Org } from './org';
import type { User } from './users';
import { emailSchema, nameSchema, PASSWORD_MAX_LENGTH, passwordSchema, phoneSchema, textSchema, tokenSchema } from './fields';

export const signupSchema = z.object({
  orgName: nameSchema,
  branchName: nameSchema,
  fullName: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export type SignupInput = z.infer<typeof signupSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password').max(PASSWORD_MAX_LENGTH),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;


export const forgotPasswordSchema = z.object({ email: emailSchema });
export const resetPasswordSchema = z.object({ token: tokenSchema, password: passwordSchema });
export const verifyEmailSchema = z.object({ token: tokenSchema });

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Enter your current password').max(PASSWORD_MAX_LENGTH),
  newPassword: passwordSchema,
});

const orgLogoContentTypeSchema = z.enum(['image/webp', 'image/png', 'image/jpeg']);
export const orgLogoInputSchema = z.object({
  contentType: orgLogoContentTypeSchema,
  /** Base64 of an optimized image, capped to keep onboarding requests small. */
  data: z.string().min(16).max(90_000).regex(/^[A-Za-z0-9+/]+={0,2}$/, 'Choose a valid image'),
});
export type OrgLogoInput = z.infer<typeof orgLogoInputSchema>;

export const googleOnboardingSchema = z.object({
  shopName: nameSchema,
  phone: phoneSchema.refine((value) => value.length > 0, 'Enter your shop phone number'),
  address: textSchema(200).min(5, 'Enter your shop address'),
  logo: orgLogoInputSchema.optional(),
});
export type GoogleOnboardingInput = z.infer<typeof googleOnboardingSchema>;

export const googleAuthSchema = z.object({
  credential: z.string().min(20).max(8192),
  /** Sent only after Google identifies a new Qist user. */
  onboarding: googleOnboardingSchema.optional(),
});
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>;

/** Explicit Google account linking, only for authenticated Qist users. */
export const googleLinkSchema = googleAuthSchema.pick({ credential: true });
/** An explicit null removes the logo. */
export const orgLogoUpdateSchema = z.object({ logo: orgLogoInputSchema.nullable() });

export interface GoogleAuthConfig {
  enabled: boolean;
  clientId: string | null;
}

export interface GoogleProfile {
  fullName: string;
  email: string;
}

export interface GoogleOnboardingRequired {
  onboardingRequired: true;
  profile: GoogleProfile;
}

export type GoogleAuthResponse = Session | GoogleOnboardingRequired;

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
