import type { Installment, ScheduledInstallment } from '@shop/shared';
import MoneyText from '../../shared/money_text';
import StatusBadge from '../../shared/status_badge';
import { formatDate } from '../../utils/dates';

interface ScheduleTableProps {
  /** A preview (no payments yet) or a contract's saved installments. */
  installments: (ScheduledInstallment | Installment)[];
}

const isSaved = (item: ScheduledInstallment | Installment): item is Installment => 'status' in item;

/** Mobile installments are readable cards; larger screens retain the compact table. */
export default function ScheduleTable({ installments }: ScheduleTableProps) {
  const saved = installments.some(isSaved);
  const total = installments.reduce((sum, item) => sum + item.amount, 0);

  return (
    <>
      <div className="space-y-2 md:hidden">
        <ol className="space-y-2">
          {installments.map((item) => (
            <li key={item.number} className="rounded-control border border-border bg-surface p-3.5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-ink">Installment {item.number}</p>
                  <p className="mt-0.5 text-xs text-muted">Due {formatDate(item.dueDate)}</p>
                </div>
                {isSaved(item) && <StatusBadge status={item.status} />}
              </div>
              <dl className={`mt-3 grid gap-3 ${saved ? 'grid-cols-2' : 'grid-cols-1'}`}>
                <div className="min-w-0">
                  <dt className="text-xs text-muted">Amount</dt>
                  <dd className="mt-0.5 break-words text-sm font-semibold text-ink">
                    <MoneyText amount={item.amount} />
                  </dd>
                </div>
                {isSaved(item) && (
                  <div className="min-w-0">
                    <dt className="text-xs text-muted">Paid</dt>
                    <dd className="mt-0.5 break-words text-sm font-semibold text-ink">
                      <MoneyText amount={item.paidAmount} />
                    </dd>
                  </div>
                )}
              </dl>
              {isSaved(item) && item.lateFee > 0 && (
                <p className="mt-2 text-xs text-danger-600">
                  + <MoneyText amount={item.lateFee} /> late fee
                </p>
              )}
            </li>
          ))}
        </ol>
        <div className="flex items-center justify-between gap-3 px-1 py-3 text-sm font-semibold text-ink">
          <span>Total installments</span>
          <MoneyText amount={total} />
        </div>
      </div>
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-start text-sm">
          <thead className="border-b border-border text-xs text-muted">
            <tr>
              <th scope="col" className="py-2 pe-3 font-medium">#</th>
              <th scope="col" className="py-2 pe-3 font-medium">Due</th>
              <th scope="col" className="py-2 pe-3 text-end font-medium">Amount</th>
              {saved && <th scope="col" className="py-2 pe-3 text-end font-medium">Paid</th>}
              {saved && <th scope="col" className="py-2 font-medium">Status</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {installments.map((item) => (
              <tr key={item.number}>
                <td className="py-2 pe-3 text-muted tabular-nums">{item.number}</td>
                <td className="py-2 pe-3 text-ink">{formatDate(item.dueDate)}</td>
                <td className="py-2 pe-3 text-end">
                  <MoneyText amount={item.amount} />
                  {isSaved(item) && item.lateFee > 0 && (
                    <span className="block text-xs text-danger-600">
                      + <MoneyText amount={item.lateFee} /> late fee
                    </span>
                  )}
                </td>
                {isSaved(item) && (
                  <>
                    <td className="py-2 pe-3 text-end text-muted"><MoneyText amount={item.paidAmount} /></td>
                    <td className="py-2"><StatusBadge status={item.status} /></td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-border font-medium text-ink">
            <tr>
              <td colSpan={2} className="py-2 pe-3">Total</td>
              <td className="py-2 pe-3 text-end"><MoneyText amount={total} /></td>
              {saved && <td colSpan={2} />}
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}
