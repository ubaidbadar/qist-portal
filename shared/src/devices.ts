import { z } from 'zod';
import { pageQuerySchema } from './api';
import { DEVICE_STOCK_STATUSES, type DeviceLockState, type DeviceStockStatus } from './constants';
import { objectIdSchema, textSchema } from './fields';
import { imeiSchema } from './identifiers';
import type { CustomerAppReport } from './customer_install';

/** Prices are integer paisa; this caps a single phone at Rs 10 million. */
export const MAX_PRICE_PAISA = 1_000_000_000;

const fields = {
  branchId: objectIdSchema,
  brand: z.string().trim().min(1, 'Enter the brand').max(40, 'Use at most 40 characters'),
  model: z.string().trim().min(1, 'Enter the model').max(60, 'Use at most 60 characters'),
  /** One IMEI per SIM slot: dual-SIM phones have two. */
  imeis: z
    .array(imeiSchema)
    .min(1, 'Enter the IMEI')
    .max(2, 'A phone has at most two IMEIs')
    .refine((imeis) => new Set(imeis).size === imeis.length, 'IMEI 1 and IMEI 2 must differ'),
  storage: textSchema(20),
  color: textSchema(30),
  ptaApproved: z.boolean(),
  /** What the shop paid, in paisa. Only owners see or set it. */
  costPrice: z.number().int().min(0).max(MAX_PRICE_PAISA).nullable(),
};

export const deviceCreateSchema = z.object({
  ...fields,
  storage: fields.storage.default(''),
  color: fields.color.default(''),
  ptaApproved: fields.ptaApproved.default(true),
  costPrice: fields.costPrice.default(null),
});

/** The branch is changed by a transfer, not an edit. */
export const deviceUpdateSchema = z.object(fields).omit({ branchId: true }).partial();

export const deviceTransferSchema = z.object({ toBranchId: objectIdSchema });

export const deviceListQuerySchema = pageQuerySchema.extend({
  branchId: objectIdSchema.optional(),
  status: z.enum(DEVICE_STOCK_STATUSES).optional(),
  /** IMEI, brand or model (or the start of one). */
  q: z.string().trim().max(40).optional(),
});

export type DeviceCreateInput = z.infer<typeof deviceCreateSchema>;
export type DeviceUpdateInput = z.infer<typeof deviceUpdateSchema>;

/** A phone in stock or sold, as the API sends it. */
export interface Device {
  _id: string;
  orgId: string;
  branchId: string;
  branch: { _id: string; name: string } | null;
  brand: string;
  model: string;
  imeis: string[];
  storage: string;
  color: string;
  ptaApproved: boolean;
  /** Present for owners only. */
  costPrice?: number | null;
  stockStatus: DeviceStockStatus;
  lockState: DeviceLockState;
  /** Set once the device app has enrolled with the setup QR (Phase 2). */
  enrollment: { enrolledAt: string; lastCheckInAt: string | null; appVersion: string; customerApp?: CustomerAppReport & { reportedAt: string } } | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
