import { describe, expect, test } from 'bun:test';
import { allocatePayment, installmentStatus, outstandingOf, type InstallmentBalance } from './allocation';

const schedule = (paid: number[] = []): InstallmentBalance[] =>
  ['2026-11-02', '2026-12-02', '2027-01-02'].map((dueDate, index) => ({ number: index + 1, dueDate, amount: 10_000, paidAmount: paid[index] ?? 0 }));

describe('allocating a payment', () => {
  test('pays the oldest installment first', () => {
    expect(allocatePayment(schedule(), 10_000)).toEqual([{ number: 1, amount: 10_000 }]);
  });

  test('a partial payment leaves the installment part paid', () => {
    expect(allocatePayment(schedule(), 4_000)).toEqual([{ number: 1, amount: 4_000 }]);
  });

  test('continues where an earlier part payment stopped', () => {
    expect(allocatePayment(schedule([4_000]), 10_000)).toEqual([
      { number: 1, amount: 6_000 },
      { number: 2, amount: 4_000 },
    ]);
  });

  test('an advance runs on into later installments', () => {
    expect(allocatePayment(schedule([10_000]), 15_000)).toEqual([
      { number: 2, amount: 10_000 },
      { number: 3, amount: 5_000 },
    ]);
  });

  test('late fees are owed on top and paid with their installment', () => {
    const withFee = schedule([10_000]).map((item) => (item.number === 2 ? { ...item, lateFee: 500 } : item));
    expect(outstandingOf(withFee)).toBe(20_500);
    expect(allocatePayment(withFee, 11_000)).toEqual([
      { number: 2, amount: 10_500 },
      { number: 3, amount: 500 },
    ]);
    expect(installmentStatus({ ...withFee[1], paidAmount: 10_000 }, '2026-12-01')).toBe('partial');
  });

  test('refuses zero and more than outstanding', () => {
    expect(outstandingOf(schedule([10_000]))).toBe(20_000);
    expect(() => allocatePayment(schedule([10_000]), 20_001)).toThrow('more than what is outstanding');
    expect(() => allocatePayment(schedule(), 0)).toThrow();
  });
});

describe('installment status', () => {
  const item = { number: 1, dueDate: '2026-11-02', amount: 10_000, paidAmount: 0 };
  test('paid, overdue, part paid, pending', () => {
    expect(installmentStatus({ ...item, paidAmount: 10_000 }, '2027-01-01')).toBe('paid');
    expect(installmentStatus({ ...item, paidAmount: 4_000 }, '2026-11-03')).toBe('overdue');
    expect(installmentStatus({ ...item, paidAmount: 4_000 }, '2026-11-02')).toBe('partial');
    expect(installmentStatus(item, '2026-11-02')).toBe('pending');
  });
});
