import { z } from 'zod';
import { pageQuerySchema } from './api';
import { nameSchema, objectIdSchema, textSchema } from './fields';
import { cnicSchema, mobileSchema, optionalMobileSchema } from './identifiers';

export const MAX_GUARANTORS = 2;

export const guarantorSchema = z.object({
  fullName: nameSchema,
  cnic: cnicSchema,
  phone: mobileSchema,
  /** How they know the customer, e.g. "brother". */
  relation: textSchema(40).default(''),
});

const fields = {
  homeBranchId: objectIdSchema,
  fullName: nameSchema,
  fatherName: textSchema(80),
  cnic: cnicSchema,
  phone: mobileSchema,
  altPhone: optionalMobileSchema,
  address: z.string().trim().min(5, 'Enter the full address').max(200, 'Use at most 200 characters'),
  notes: textSchema(500),
  guarantors: z.array(guarantorSchema).max(MAX_GUARANTORS, `At most ${MAX_GUARANTORS} guarantors`),
};

export const customerCreateSchema = z.object({
  ...fields,
  fatherName: fields.fatherName.default(''),
  altPhone: fields.altPhone.default(''),
  notes: fields.notes.default(''),
  guarantors: fields.guarantors.default([]),
});

// Every field optional and without defaults, so an update only touches what was sent.
export const customerUpdateSchema = z.object(fields).partial();

export const customerListQuerySchema = pageQuerySchema.extend({
  /** Name, mobile or CNIC (or the start of one). */
  q: z.string().trim().max(60).optional(),
});

export type GuarantorInput = z.infer<typeof guarantorSchema>;
export type CustomerCreateInput = z.infer<typeof customerCreateSchema>;
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>;

export type Guarantor = GuarantorInput;

/** A customer, as the API sends it. Customers belong to the organization and are shared by all its branches. */
export interface Customer {
  _id: string;
  orgId: string;
  /** Where they first bought; their records are visible from every branch. */
  homeBranchId: string;
  homeBranch: { _id: string; name: string } | null;
  fullName: string;
  fatherName: string;
  cnic: string;
  phone: string;
  altPhone: string;
  address: string;
  notes: string;
  guarantors: Guarantor[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
