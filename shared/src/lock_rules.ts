import type { LockMode } from './constants';
import type { CalendarDate } from './dates';
import type { Paisa } from './money';

/** How a retailer locks phones (docs/plan.md §5). Set by the owner; these are the defaults. */
export interface LockPolicy {
  mode: LockMode;
  /** Days after a due date before a phone may be locked; 0 = the day after. */
  graceDays: number;
  /** Hour of the day (Pakistan time) when automatic locks go out, so the customer can come and pay. */
  lockHour: number;
  /** Below this overdue amount a phone is never locked. */
  minOverdue: Paisa;
  unlockOnPayment: boolean;
}

export const DEFAULT_LOCK_POLICY: LockPolicy = { mode: 'approval', graceDays: 3, lockHour: 10, minOverdue: 50_000, unlockOnPayment: true };

export interface DueInstallment {
  dueDate: CalendarDate;
  amount: Paisa;
  lateFee: Paisa;
  paidAmount: Paisa;
}

const unpaid = (item: DueInstallment) => item.amount + item.lateFee - item.paidAmount;
const daysBetween = (from: CalendarDate, to: CalendarDate) => Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);

/** Days since the oldest installment that is past due and not fully paid; 0 when nothing is late. */
export function daysOverdue(installments: DueInstallment[], today: CalendarDate) {
  const late = installments.filter((item) => item.dueDate < today && unpaid(item) > 0).map((item) => item.dueDate).sort();
  return late.length === 0 ? 0 : daysBetween(late[0], today);
}

/** What is owed on installments already past due, late fees included. */
export const overdueAmount = (installments: DueInstallment[], today: CalendarDate) =>
  installments.filter((item) => item.dueDate < today).reduce((sum, item) => sum + Math.max(0, unpaid(item)), 0);

export interface LockSituation {
  policy: LockPolicy;
  installments: DueInstallment[];
  today: CalendarDate;
  /** "YYYY-MM-DD": auto-lock is paused through this day (a promise to pay). */
  pausedUntil: CalendarDate | null;
}

/**
 * Whether a contract should lock its phone now, under the policy: late more than the grace days, owing at least
 * the minimum, and not paused. Whether the phone is already locked is the caller's concern.
 */
export function shouldLock({ policy, installments, today, pausedUntil }: LockSituation) {
  if (policy.mode === 'off') return false;
  if (pausedUntil && pausedUntil >= today) return false;
  return daysOverdue(installments, today) > policy.graceDays && overdueAmount(installments, today) >= policy.minOverdue;
}

/** After a payment: a locked phone (or one waiting to be locked) is let go once it no longer qualifies. */
export const shouldUnlock = (situation: LockSituation) => situation.policy.unlockOnPayment && !shouldLock(situation);
