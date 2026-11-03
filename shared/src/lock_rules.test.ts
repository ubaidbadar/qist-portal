import { describe, expect, test } from 'bun:test';
import { daysOverdue, DEFAULT_LOCK_POLICY, overdueAmount, shouldLock, shouldUnlock, type DueInstallment } from './lock_rules';

const installments: DueInstallment[] = [
  { dueDate: '2026-11-01', amount: 10_000_00, lateFee: 0, paidAmount: 10_000_00 },
  { dueDate: '2026-12-01', amount: 10_000_00, lateFee: 500_00, paidAmount: 2_000_00 },
  { dueDate: '2027-01-01', amount: 10_000_00, lateFee: 0, paidAmount: 0 },
];
const situation = (today: string, overrides = {}) => ({ policy: DEFAULT_LOCK_POLICY, installments, today, pausedUntil: null, ...overrides });

describe('overdue', () => {
  test('days count from the oldest unpaid due date; paid installments do not count', () => {
    expect(daysOverdue(installments, '2026-12-01')).toBe(0);
    expect(daysOverdue(installments, '2026-12-05')).toBe(4);
    expect(daysOverdue(installments, '2027-01-03')).toBe(33);
  });

  test('the overdue amount includes late fees and leaves future installments out', () => {
    expect(overdueAmount(installments, '2026-12-05')).toBe(8_500_00);
    expect(overdueAmount(installments, '2027-01-02')).toBe(18_500_00);
  });
});

describe('when to lock', () => {
  test('only after the grace days: 3 days late is not enough, 4 is', () => {
    expect(shouldLock(situation('2026-12-04'))).toBe(false);
    expect(shouldLock(situation('2026-12-05'))).toBe(true);
  });

  test('never below the minimum, while paused, or with locking off', () => {
    expect(shouldLock(situation('2026-12-05', { policy: { ...DEFAULT_LOCK_POLICY, minOverdue: 9_000_00 } }))).toBe(false);
    expect(shouldLock(situation('2026-12-05', { pausedUntil: '2026-12-05' }))).toBe(false);
    expect(shouldLock(situation('2026-12-06', { pausedUntil: '2026-12-05' }))).toBe(true);
    expect(shouldLock(situation('2026-12-05', { policy: { ...DEFAULT_LOCK_POLICY, mode: 'off' } }))).toBe(false);
  });

  test('a grace of 0 locks the day after the due date', () => {
    expect(shouldLock(situation('2026-12-02', { policy: { ...DEFAULT_LOCK_POLICY, graceDays: 0 } }))).toBe(true);
  });

  test('unlock once the overdue amount is paid, unless the owner turned that off', () => {
    const paidUp = installments.map((item) => ({ ...item, paidAmount: item.dueDate < '2026-12-05' ? item.amount + item.lateFee : 0 }));
    expect(shouldUnlock(situation('2026-12-05', { installments: paidUp }))).toBe(true);
    expect(shouldUnlock(situation('2026-12-05'))).toBe(false);
    expect(shouldUnlock(situation('2026-12-05', { installments: paidUp, policy: { ...DEFAULT_LOCK_POLICY, unlockOnPayment: false } }))).toBe(false);
  });
});
