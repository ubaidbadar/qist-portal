import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Receipt } from 'lucide-react';
import type { Payment } from '@shop/shared';
import { Badge, Card, Skeleton } from '../../ui';
import MoneyText from '../../shared/money_text';
import QueryView from '../../shared/query_view';
import PaymentLauncher from '../payments/payment_launcher';
import { dashboardPaymentsQuery } from './queries';

/** Today's actual receipts and a direct entry point for recording the next one. */
export default function PaymentsPanel({ branchId, date }: { branchId: string | undefined; date: string }) {
  const payments = useQuery(dashboardPaymentsQuery(date, branchId));

  return (
    <Card padding="none" className="flex min-w-0 flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold text-ink">Today's payments</h2>
        <Link to="/payments" className="text-sm font-semibold text-accent hover:underline">View all</Link>
      </div>
      <QueryView query={payments} skeleton={<Skeleton className="h-56 rounded-card" />}>
        {(page) => page.items.length ? (
          <ul className="divide-y divide-border">
            {page.items.map((payment: Payment) => (
              <li key={payment._id} className="flex items-center justify-between gap-4 px-5 py-3.5 text-sm">
                <div className="min-w-0">
                  <Link to={`/payments/${payment._id}/receipt`} className="block truncate font-semibold text-ink hover:text-accent">
                    {payment.customerName}
                  </Link>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {payment.deviceLabel} · Receipt #{payment.receiptNumber}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {payment.voidedAt && <Badge variant="neutral" pill>Void</Badge>}
                  <MoneyText amount={payment.amount} className={payment.voidedAt ? 'line-through text-muted' : 'font-semibold text-success-800'} />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex min-h-52 flex-col items-center justify-center px-6 py-8 text-center">
            <span className="mb-3 grid size-11 place-items-center rounded-pill bg-info-100 text-info-800">
              <Receipt size={21} aria-hidden="true" />
            </span>
            <p className="font-semibold text-ink">No payments today</p>
            <p className="mt-1 max-w-xs text-sm text-muted">Recorded payments will appear here with their receipts.</p>
          </div>
        )}
      </QueryView>
      <div className="mt-auto border-t border-border px-5 py-3">
        <PaymentLauncher />
      </div>
    </Card>
  );
}
