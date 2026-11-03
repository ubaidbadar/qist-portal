import { z } from 'zod';
import { nameSchema, phoneSchema, textSchema } from './fields';

const addressSchema = textSchema(200);

export const branchCreateSchema = z.object({
  name: nameSchema,
  phone: phoneSchema.default(''),
  address: addressSchema.default(''),
});

// Spelled out rather than `.partial()`: in Zod 4 a partial keeps the defaults, so a rename would blank the phone.
export const branchUpdateSchema = z.object({
  name: nameSchema.optional(),
  phone: phoneSchema.optional(),
  address: addressSchema.optional(),
  active: z.boolean().optional(),
});

export type BranchCreateInput = z.infer<typeof branchCreateSchema>;
export type BranchUpdateInput = z.infer<typeof branchUpdateSchema>;

export interface Branch {
  _id: string;
  orgId: string;
  name: string;
  phone: string;
  address: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
