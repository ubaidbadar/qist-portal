import { z } from 'zod';
import { PAYMENT_METHODS, type PaymentMethod } from './constants';
import { calendarDateSchema } from './contracts';
import { MAX_PRICE_PAISA } from './devices';
import { objectIdSchema, textSchema } from './fields';
import { pageQuerySchema } from './api';

export const PAYMENT_KINDS = ['down_payment', 'installment'] as const;
export type PaymentKind = (typeof PAYMENT_KINDS)[number];

/** Sent with a new payment so a retry (double click, dropped connection) can never record it twice. */
export const IDEMPOTENCY_HEADER = 'Idempotency-Key';

export const paymentCreateSchema = z.object({
  /** The branch where the money was received; any branch of the retailer the user works at. */
  branchId: objectIdSchema,
  amount: z.number().int().min(1, 'Enter the amount').max(MAX_PRICE_PAISA),
  method: z.enum(PAYMENT_METHODS),
  /** Transaction id for JazzCash, Easypaisa or bank transfers. */
  reference: textSchema(60).default(''),
});

export const paymentVoidSchema = z.object({ reason: textSchema(300).min(5, 'Say why, in a few words') });

export const paymentListQuerySchema = pageQuerySchema.extend({
  branchId: objectIdSchema.optional(),
  date: calendarDateSchema.optional(),
});

export const collectionsQuerySchema = z.object({ branchId: objectIdSchema.optional(), date: calendarDateSchema });

export type PaymentCreateInput = z.infer<typeof paymentCreateSchema>;

export interface PaymentAllocation {
  installmentId: string;
  number: number;
  amount: number;
}

export interface Payment {
  _id: string;
  orgId: string;
  branchId: string;
  branch: { _id: string; name: string } | null;
  contractId: string;
  customerId: string;
  customerName: string;
  deviceLabel: string;
  kind: PaymentKind;
  amount: number;
  method: PaymentMethod;
  reference: string;
  receiptNumber: number;
  allocations: PaymentAllocation[];
  receivedBy: string;
  receivedByName: string;
  /** "YYYY-MM-DD" in Pakistan time, for daily collections. */
  receivedOn: string;
  voidedAt: string | null;
  voidReason: string;
  createdAt: string;
}

/** One day's money at one branch (or all branches), as counted by the cashier. */
export interface Collections {
  date: string;
  total: number;
  count: number;
  byMethod: { method: PaymentMethod; total: number; count: number }[];
  byStaff: { userId: string; name: string; total: number; count: number }[];
}


/** Daily totals and receipt rows for the same date and branch scope. */
export interface PaymentsOverview {
  items: Payment[];
  nextCursor: string | null;
  collections: Collections;
}
