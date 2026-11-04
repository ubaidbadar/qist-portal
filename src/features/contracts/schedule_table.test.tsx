import { describe, expect, test } from 'bun:test';
import { renderToStaticMarkup } from 'react-dom/server';
import type { Installment, ScheduledInstallment } from '@shop/shared';
import ScheduleTable from './schedule_table';

const preview: ScheduledInstallment[] = [
  { number: 1, dueDate: '2026-11-10', amount: 100_000 },
  { number: 2, dueDate: '2026-12-10', amount: 200_000 },
];

const saved: Installment[] = [
  {
    _id: 'one',
    contractId: 'contract',
    number: 1,
    dueDate: '2026-11-10',
    amount: 100_000,
    paidAmount: 50_000,
    lateFee: 5_000,
    status: 'partial',
  },
];

describe('contract schedule responsive presentation', () => {
  test('preview renders numbered mobile cards and desktop table from the same schedule', () => {
    const html = renderToStaticMarkup(<ScheduleTable installments={preview} />);
    expect(html).toContain('Installment 1');
    expect(html).toContain('Installment 2');
    expect(html).toContain('md:hidden');
    expect(html).toContain('md:block');
    expect(html).toContain('Total installments');
    expect(html).toContain('<table');
  });

  test('saved installments show payment state and late fees in both presentations', () => {
    const html = renderToStaticMarkup(<ScheduleTable installments={saved} />);
    expect(html).toContain('Part paid');
    expect(html).toContain('late fee');
    expect(html).toContain('Paid');
  });
});
