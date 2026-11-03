import { z } from 'zod';
import type { Role } from './constants';
import { emailSchema, nameSchema, objectIdSchema } from './fields';

/** Roles an owner can give. Each organization has exactly one owner, created at signup. */
export const ASSIGNABLE_ROLES = ['manager', 'staff'] as const;

const branchIdsSchema = z.array(objectIdSchema).min(1, 'Choose at least one branch').max(100);

export const memberCreateSchema = z.object({
  fullName: nameSchema,
  email: emailSchema,
  role: z.enum(ASSIGNABLE_ROLES),
  branchIds: branchIdsSchema,
});

export const memberUpdateSchema = z.object({
  fullName: nameSchema.optional(),
  role: z.enum(ASSIGNABLE_ROLES).optional(),
  branchIds: branchIdsSchema.optional(),
});

export const memberActiveSchema = z.object({ active: z.boolean() });

export type MemberCreateInput = z.infer<typeof memberCreateSchema>;
export type MemberUpdateInput = z.infer<typeof memberUpdateSchema>;

/** A person who can sign in, as the API sends them (the password hash never leaves the server). */
export interface User {
  _id: string;
  orgId: string;
  email: string;
  fullName: string;
  role: Role;
  /** Branches a manager or staff member works in; empty for the owner, who sees every branch. */
  branchIds: string[];
  active: boolean;
  emailVerifiedAt: string | null;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

/** The temporary password is returned once, for the owner to hand over; only its hash is stored. */
export interface UserWithTemporaryPassword {
  user: User;
  temporaryPassword: string;
}
