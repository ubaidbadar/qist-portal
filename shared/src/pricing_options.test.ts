import { expect, test } from 'bun:test';
import { buildSchedule, priceContract } from './schedule';
import { planCreateSchema, planUpdateSchema } from './plans';
import { paymentSettingsSchema } from './org';

const terms = { cashPrice: 5_000_000, downPayment: 1_000_000, markupPercent: 20 };
test('50,000 less 10,000: markup on full price or remaining balance, with exact schedules', () => {
  const balance = priceContract({ ...terms, markupBasis: 'financed' });
  const full = priceContract({ ...terms, markupBasis: 'cash_price' });
  expect(balance).toEqual({ financedAmount: 4_000_000, markupAmount: 800_000, totalPayable: 4_800_000 });
  expect(full).toEqual({ financedAmount: 4_000_000, markupAmount: 1_000_000, totalPayable: 5_000_000 });
  expect(priceContract(terms)).toEqual(balance);
  for (const pricing of [balance, full]) expect(buildSchedule(pricing.totalPayable, 7, 'monthly', '2026-12-01').reduce((sum, row) => sum + row.amount, 0)).toBe(pricing.totalPayable);
  for (const markupBasis of ['financed', 'cash_price'] as const) {
    expect(priceContract({ ...terms, markupBasis, downPayment: 0 }).markupAmount).toBe(1_000_000);
    expect(priceContract({ ...terms, markupBasis, markupPercent: 0 }).totalPayable).toBe(4_000_000);
  }
});
test('old plan creation defaults to balance; editing a name does not change the basis', () => {
  expect(planCreateSchema.parse({ name: 'Six months', count: 6, frequency: 'monthly', markupPercent: 20 }).markupBasis).toBe('financed');
  expect(planUpdateSchema.parse({ name: 'New name' })).toEqual({ name: 'New name' });
});
test('payment instructions validate and normalize wallet numbers and Pakistani IBANs', () => {
  const id = '3f218845-d737-479d-902d-b13f141e35f1';
  const wallet = { id, enabled: true, kind: 'easypaisa', accountTitle: 'Account Holder', accountNumber: '+92 300 1234567' };
  expect(paymentSettingsSchema.parse({ paymentMethods: [wallet] }).paymentMethods[0]).toMatchObject({ accountNumber: '03001234567' });
  const bank = { ...wallet, kind: 'bank', bankName: 'Bank', accountNumber: 'pk36 scbl 0000 0011 2345 6702' };
  expect(paymentSettingsSchema.parse({ paymentMethods: [bank] }).paymentMethods[0]).toMatchObject({ accountNumber: 'PK36SCBL0000001123456702' });
  expect(paymentSettingsSchema.safeParse({ paymentMethods: [{ ...bank, accountNumber: 'PK00SCBL0000001123456702' }] }).success).toBe(false);
  expect(paymentSettingsSchema.safeParse({ paymentMethods: [{ ...wallet, accountNumber: '123' }] }).success).toBe(false);
  expect(paymentSettingsSchema.safeParse({ paymentMethods: [wallet, wallet] }).success).toBe(false);
});
