import { z } from 'zod';
import { pageQuerySchema } from './api';
import { CONTRACT_STATUSES, FREQUENCIES, PAYMENT_METHODS, type ContractStatus, type Frequency, type InstallmentStatus } from './constants';
import { isCalendarDate } from './dates';
import { MAX_PRICE_PAISA } from './devices';
import { objectIdSchema, textSchema } from './fields';
import { installmentCountSchema, markupPercentSchema } from './plans';

const paisaSchema = z.number().int().min(0).max(MAX_PRICE_PAISA);
export const calendarDateSchema = z.string().refine(isCalendarDate, 'Choose a date');

/** A sale on installments. Prices are paisa; the server recalculates every amount from these terms. */
export const contractCreateSchema = z
  .object({
    branchId: objectIdSchema,
    customerId: objectIdSchema,
    deviceId: objectIdSchema,
    /** The plan the terms came from, if any (kept for reports). */
    planId: objectIdSchema.nullable().default(null),
    cashPrice: paisaSchema.min(1, 'Enter the price'),
    downPayment: paisaSchema,
    /** How the down payment was received; it gets a receipt like any payment. */
    downPaymentMethod: z.enum(PAYMENT_METHODS).default('cash'),
    markupPercent: markupPercentSchema,
    count: installmentCountSchema,
    frequency: z.enum(FREQUENCIES),
    firstDueDate: calendarDateSchema,
  })
  .refine((terms) => terms.downPayment < terms.cashPrice, { message: 'The down payment must be less than the price', path: ['downPayment'] });

export const contractCancelSchema = z.object({ reason: textSchema(300).min(5, 'Say why, in a few words') });

export const contractListQuerySchema = pageQuerySchema.extend({
  branchId: objectIdSchema.optional(),
  customerId: objectIdSchema.optional(),
  status: z.enum(CONTRACT_STATUSES).optional(),
});

export type ContractCreateInput = z.infer<typeof contractCreateSchema>;

export interface Installment {
  _id: string;
  contractId: string;
  number: number;
  dueDate: string;
  amount: number;
  lateFee: number;
  paidAmount: number;
  status: InstallmentStatus;
}

/** A contract as the API sends it. Customer and phone details are copied in at sale, so the contract never changes. */
export interface Contract {
  _id: string;
  orgId: string;
  branchId: string;
  branch: { _id: string; name: string } | null;
  customerId: string;
  customerName: string;
  customerCnic: string;
  deviceId: string;
  deviceLabel: string;
  imeis: string[];
  planId: string | null;
  cashPrice: number;
  downPayment: number;
  markupPercent: number;
  financedAmount: number;
  markupAmount: number;
  totalPayable: number;
  count: number;
  frequency: Frequency;
  firstDueDate: string;
  paidTotal: number;
  /** Late fees added so far, owed on top of totalPayable. */
  lateFees: number;
  status: ContractStatus;
  /** "YYYY-MM-DD": no automatic lock through this day (a promise to pay). */
  autoLockPausedUntil: string | null;
  pauseReason: string;
  cancelReason: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractWithSchedule extends Contract {
  installments: Installment[];
}
