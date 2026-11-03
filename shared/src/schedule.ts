import type { Frequency } from './constants';
import { addDays, addMonths, type CalendarDate } from './dates';
import type { Paisa } from './money';

export interface Terms {
  cashPrice: Paisa;
  downPayment: Paisa;
  /** Percentage added to the financed amount, e.g. 25 for 25%. */
  markupPercent: number;
}

export interface Pricing {
  financedAmount: Paisa;
  markupAmount: Paisa;
  /** What the installments add up to (the down payment is paid at sale, on top). */
  totalPayable: Paisa;
}

/** Cash price minus down payment, plus markup on that. Rounded to whole paisa once, here. */
export function priceContract({ cashPrice, downPayment, markupPercent }: Terms): Pricing {
  const financedAmount = cashPrice - downPayment;
  const markupAmount = Math.round((financedAmount * markupPercent) / 100);
  return { financedAmount, markupAmount, totalPayable: financedAmount + markupAmount };
}

export interface ScheduledInstallment {
  number: number;
  dueDate: CalendarDate;
  amount: Paisa;
}

const DAYS_BETWEEN: Record<Exclude<Frequency, 'monthly'>, number> = { weekly: 7, biweekly: 14 };

/** The due date of installment `index` (0-based), always counted from the first, so monthly dates never drift. */
export function dueDateOf(firstDueDate: CalendarDate, frequency: Frequency, index: number): CalendarDate {
  return frequency === 'monthly' ? addMonths(firstDueDate, index) : addDays(firstDueDate, DAYS_BETWEEN[frequency] * index);
}

/**
 * Equal installments in whole paisa that add up to exactly `totalPayable`; the rounding remainder goes on the last
 * one. E.g. Rs 1,000 over 3 → 333.33, 333.33, 333.34.
 */
export function buildSchedule(totalPayable: Paisa, count: number, frequency: Frequency, firstDueDate: CalendarDate): ScheduledInstallment[] {
  const base = Math.floor(totalPayable / count);
  const remainder = totalPayable - base * count;
  return Array.from({ length: count }, (_, index) => ({
    number: index + 1,
    dueDate: dueDateOf(firstDueDate, frequency, index),
    amount: index === count - 1 ? base + remainder : base,
  }));
}
