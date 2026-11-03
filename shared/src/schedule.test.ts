import { describe, expect, test } from 'bun:test';
import { addMonths, isCalendarDate, todayInShops } from './dates';
import { buildSchedule, priceContract } from './schedule';

describe('pricing', () => {
  test('markup applies to the financed amount only', () => {
    expect(priceContract({ cashPrice: 6_000_000, downPayment: 1_000_000, markupPercent: 25 })).toEqual({
      financedAmount: 5_000_000,
      markupAmount: 1_250_000,
      totalPayable: 6_250_000,
    });
  });

  test('fractional markups round to whole paisa', () => {
    expect(priceContract({ cashPrice: 1_000_01, downPayment: 0, markupPercent: 12.5 }).markupAmount).toBe(12_500);
  });
});

describe('schedule', () => {
  test('installments add up exactly; the remainder goes on the last', () => {
    const schedule = buildSchedule(1_000_00, 3, 'monthly', '2026-11-05');
    expect(schedule.map((i) => i.amount)).toEqual([33_333, 33_333, 33_334]);
    for (const [total, count] of [[6_250_000, 7], [99_999, 12], [1, 3], [5_000_00, 24]]) {
      const amounts = buildSchedule(total, count, 'weekly', '2026-01-01').map((i) => i.amount);
      expect(amounts.reduce((sum, amount) => sum + amount, 0)).toBe(total);
      expect(amounts).toHaveLength(count);
    }
  });

  test('weekly and biweekly dates', () => {
    expect(buildSchedule(300, 3, 'weekly', '2026-12-28').map((i) => i.dueDate)).toEqual(['2026-12-28', '2027-01-04', '2027-01-11']);
    expect(buildSchedule(200, 2, 'biweekly', '2026-02-20').map((i) => i.dueDate)).toEqual(['2026-02-20', '2026-03-06']);
  });

  test('month ends clamp without drifting: 31 Jan → 28 Feb → 31 Mar', () => {
    expect(buildSchedule(400, 4, 'monthly', '2027-01-31').map((i) => i.dueDate)).toEqual(['2027-01-31', '2027-02-28', '2027-03-31', '2027-04-30']);
  });

  test('leap years: 29 Feb exists in 2028, and a 29 Feb start lands on 28 Feb next year', () => {
    expect(addMonths('2028-01-30', 1)).toBe('2028-02-29');
    expect(addMonths('2028-02-29', 12)).toBe('2029-02-28');
  });
});

describe('calendar dates', () => {
  test('today is taken in Pakistan time', () => {
    // 20:30 UTC on 31 Dec is already 1 Jan in Karachi (UTC+5).
    expect(todayInShops(new Date('2026-12-31T20:30:00Z'))).toBe('2027-01-01');
  });

  test('only real dates are accepted', () => {
    expect(isCalendarDate('2026-02-28')).toBe(true);
    expect(isCalendarDate('2026-02-30')).toBe(false);
    expect(isCalendarDate('28-02-2026')).toBe(false);
  });
});
