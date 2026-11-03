import { z } from 'zod';
import { pageQuerySchema } from './api';
import { COMMAND_STATUSES, LOCK_MODES, type CommandSource, type CommandStatus, type CommandType, type DeviceLockState } from './constants';
import { calendarDateSchema } from './contracts';
import { MAX_PRICE_PAISA } from './devices';
import { objectIdSchema, textSchema } from './fields';

const reasonSchema = textSchema(300).min(5, 'Say why, in a few words');

export const lockRequestSchema = z.object({ reason: reasonSchema });
export const commandRejectSchema = z.object({ reason: reasonSchema });

/** A promise to pay: no automatic lock through `until`. */
export const pauseLockSchema = z.object({ until: calendarDateSchema, reason: reasonSchema });

export const commandListQuerySchema = pageQuerySchema.extend({
  status: z.enum(COMMAND_STATUSES).optional(),
  branchId: objectIdSchema.optional(),
  contractId: objectIdSchema.optional(),
});

export const overdueListQuerySchema = z.object({ branchId: objectIdSchema.optional() });

/** The owner's lock and late-fee settings (PATCH /org/policy). */
export const policyUpdateSchema = z.object({
  lockPolicy: z
    .object({
      mode: z.enum(LOCK_MODES),
      graceDays: z.number().int().min(0).max(60),
      lockHour: z.number().int().min(0).max(23),
      minOverdue: z.number().int().min(0).max(MAX_PRICE_PAISA),
      unlockOnPayment: z.boolean(),
    })
    .partial()
    .optional(),
  lateFee: z.object({ enabled: z.boolean(), amount: z.number().int().min(0).max(MAX_PRICE_PAISA) }).partial().optional(),
});

export type PolicyUpdateInput = z.infer<typeof policyUpdateSchema>;

/** An instruction for a phone. Waits until the device app (Phase 2) picks it up. */
export interface DeviceCommand {
  _id: string;
  orgId: string;
  branchId: string;
  deviceId: string;
  contractId: string;
  customerName: string;
  deviceLabel: string;
  type: CommandType;
  status: CommandStatus;
  source: CommandSource;
  reason: string;
  requestedByName: string;
  decidedByName: string;
  decisionReason: string;
  createdAt: string;
  updatedAt: string;
}

/** A contract with installments past due, for the Lock Center and reminders. */
export interface OverdueAccount {
  contractId: string;
  branchId: string;
  customerId: string;
  customerName: string;
  deviceId: string;
  deviceLabel: string;
  lockState: DeviceLockState;
  daysOverdue: number;
  overdueAmount: number;
  oldestDueDate: string;
  autoLockPausedUntil: string | null;
  openCommand: { _id: string; type: CommandType; status: CommandStatus } | null;
}
