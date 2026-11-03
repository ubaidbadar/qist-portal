import type { Installment, ScheduledInstallment } from '@shop/shared';
import MoneyText from '../../shared/money_text';
import StatusBadge from '../../shared/status_badge';
import { formatDate } from '../../utils/dates';

interface ScheduleTableProps {
  /** A preview (no payments yet) or a contract's saved installments. */
  installments: (ScheduledInstallment | Installment)[];
}

const isSaved = (item: ScheduledInstallment | Installment): item is Installment => 'status' in item;

/** The installment schedule: due dates and amounts, plus payments and status once saved. Prints cleanly. */
export default function ScheduleTable({ installments }: ScheduleTableProps) {
  const saved = installments.some(isSaved);
  const total = installments.reduce((sum, item) => sum + item.amount, 0);

  return (
    <table className="w-full text-left text-sm">
      <thead className="border-b border-border text-xs text-muted">
        <tr>
          <th scope="col" className="py-2 pr-3 font-medium">#</th>
          <th scope="col" className="py-2 pr-3 font-medium">Due</th>
          <th scope="col" className="py-2 pr-3 text-right font-medium">Amount</th>
          {saved && <th scope="col" className="py-2 pr-3 text-right font-medium">Paid</th>}
          {saved && <th scope="col" className="py-2 font-medium">Status</th>}
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {installments.map((item) => (
          <tr key={item.number}>
            <td className="py-2 pr-3 text-muted tabular-nums">{item.number}</td>
            <td className="py-2 pr-3 text-ink">{formatDate(item.dueDate)}</td>
            <td className="py-2 pr-3 text-right">
              <MoneyText amount={item.amount} />
              {isSaved(item) && item.lateFee > 0 && (
                <span className="block text-xs text-danger-600">
                  + <MoneyText amount={item.lateFee} /> late fee
                </span>
              )}
            </td>
            {isSaved(item) && (
              <>
                <td className="py-2 pr-3 text-right text-muted">
                  <MoneyText amount={item.paidAmount} />
                </td>
                <td className="py-2">
                  <StatusBadge status={item.status} />
                </td>
              </>
            )}
          </tr>
        ))}
      </tbody>
      <tfoot className="border-t border-border font-medium text-ink">
        <tr>
          <td colSpan={2} className="py-2 pr-3">
            Total
          </td>
          <td className="py-2 pr-3 text-right">
            <MoneyText amount={total} />
          </td>
          {saved && <td colSpan={2} />}
        </tr>
      </tfoot>
    </table>
  );
}
