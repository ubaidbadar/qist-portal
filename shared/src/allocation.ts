import type { InstallmentStatus } from './constants';
import type { CalendarDate } from './dates';
import type { Paisa } from './money';

export interface InstallmentBalance {
  number: number;
  dueDate: CalendarDate;
  amount: Paisa;
  /** Added by the overdue job when late fees are on; owed on top of the amount. */
  lateFee?: Paisa;
  paidAmount: Paisa;
}

/** What an installment still owes, late fee included. */
export const dueOn = ({ amount, lateFee = 0, paidAmount }: InstallmentBalance) => amount + lateFee - paidAmount;

/** Paid in full, past due and not paid, partly paid, or not yet due. */
export function installmentStatus(installment: InstallmentBalance, today: CalendarDate): InstallmentStatus {
  const { paidAmount, dueDate } = installment;
  if (dueOn(installment) <= 0) return 'paid';
  if (dueDate < today) return 'overdue';
  return paidAmount > 0 ? 'partial' : 'pending';
}

export const outstandingOf = (installments: InstallmentBalance[]) =>
  installments.reduce((sum, item) => sum + dueOn(item), 0);

export interface Allocation {
  number: number;
  amount: Paisa;
}

/**
 * Spreads a payment over the oldest unpaid installments first. Paying less than one installment leaves it part
 * paid; paying more runs on into later installments (an advance). Refuses more than is outstanding.
 */
export function allocatePayment(installments: InstallmentBalance[], amount: Paisa): Allocation[] {
  if (amount <= 0) throw new RangeError('A payment must be more than zero');
  if (amount > outstandingOf(installments)) throw new RangeError('The payment is more than what is outstanding');

  const allocations: Allocation[] = [];
  let left = amount;
  for (const item of [...installments].sort((a, b) => a.number - b.number)) {
    const due = dueOn(item);
    if (left === 0) break;
    if (due <= 0) continue;
    const applied = Math.min(due, left);
    allocations.push({ number: item.number, amount: applied });
    left -= applied;
  }
  return allocations;
}
