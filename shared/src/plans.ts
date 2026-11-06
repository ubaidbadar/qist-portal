import { z } from 'zod';
import { FREQUENCIES, type Frequency } from './constants';
import { nameSchema } from './fields';

export const MARKUP_BASES = ['financed', 'cash_price'] as const;
export type MarkupBasis = (typeof MARKUP_BASES)[number];
export const markupBasisSchema = z.enum(MARKUP_BASES);

export const MAX_INSTALLMENTS = 60;

export const installmentCountSchema = z.number().int().min(1, 'At least 1 installment').max(MAX_INSTALLMENTS, `At most ${MAX_INSTALLMENTS} installments`);
export const markupPercentSchema = z.number().min(0, "Markup can't be negative").max(200, 'At most 200%').multipleOf(0.01);
const percentSchema = z.number().min(0).max(100);

const fields = {
  name: nameSchema,
  frequency: z.enum(FREQUENCIES),
  count: installmentCountSchema,
  markupPercent: markupPercentSchema,
  markupBasis: markupBasisSchema,
  /** The smallest down payment the plan accepts, as a share of the cash price. */
  minDownPaymentPercent: percentSchema,
  active: z.boolean(),
};

export const planCreateSchema = z.object({ ...fields, markupBasis: fields.markupBasis.default('financed'), minDownPaymentPercent: fields.minDownPaymentPercent.default(0), active: fields.active.default(true) });
export const planUpdateSchema = z.object(fields).partial();

export type PlanCreateInput = z.infer<typeof planCreateSchema>;
export type PlanUpdateInput = z.infer<typeof planUpdateSchema>;

/** A ready-made set of terms, e.g. "6 months, 25%", so every branch sells on the same terms. */
export interface InstallmentPlan {
  _id: string;
  orgId: string;
  name: string;
  frequency: Frequency;
  count: number;
  markupPercent: number;
  markupBasis?: MarkupBasis;
  minDownPaymentPercent: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
