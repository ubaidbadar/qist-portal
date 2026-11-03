import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { Payment } from '@shop/shared';
import { Badge, Card } from '../../ui';
import { useCan } from '../../auth';
import ListSkeleton from '../../shared/list_skeleton';
import MoneyText from '../../shared/money_text';
import QueryView from '../../shared/query_view';
import { formatDate } from '../../utils/dates';
import { KIND_LABELS, METHOD_LABELS } from './labels';
import { ledgerQuery } from './queries';
import VoidPaymentModal from './void_payment_modal';

interface LedgerCardProps {
  contractId: string;
  payments?: Payment[];
}

/** Every payment on a contract, newest first, voided ones crossed out. */
export default function LedgerCard({ contractId, payments: initialPayments }: LedgerCardProps) {
  const query = useQuery({
    ...ledgerQuery(contractId),
    enabled: initialPayments === undefined,
  });
  const payments = initialPayments ?? query.data;

  return (
    <Card>
      <h2 className="mb-3 text-base font-semibold text-ink">Payments</h2>
      {payments !== undefined ? (
        payments.length === 0 ? (
          <p className="text-sm text-muted">No payments yet.</p>
        ) : (
          <ul className="divide-y divide-border">
            {payments.map((payment) => (
              <LedgerRow key={payment._id} payment={payment} />
            ))}
          </ul>
        )
      ) : (
        <QueryView query={query} skeleton={<ListSkeleton rows={2} />}>
          {(loaded) =>
            loaded.length === 0 ? (
              <p className="text-sm text-muted">No payments yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {loaded.map((payment) => (
                  <LedgerRow key={payment._id} payment={payment} />
                ))}
              </ul>
            )
          }
        </QueryView>
      )}
    </Card>
  );
}

function LedgerRow({ payment }: { payment: Payment }) {
  const can = useCan();
  const voided = Boolean(payment.voidedAt);

  return (
    <li className="flex items-center gap-3 py-3 text-sm">
      <div className={`min-w-0 flex-1 ${voided ? 'opacity-60' : ''}`}>
        <p className="flex flex-wrap items-center gap-2 font-medium text-ink">
          <MoneyText amount={payment.amount} className={voided ? 'line-through' : ''} />
          <span className="font-normal text-muted">
            {KIND_LABELS[payment.kind]} · {METHOD_LABELS[payment.method]}
          </span>
          {voided && <Badge variant="neutral" pill>Void: {payment.voidReason}</Badge>}
        </p>
        <p className="text-xs text-muted">
          <Link to={`/payments/${payment._id}/receipt`} className="text-accent hover:underline">Receipt {payment.receiptNumber}</Link> · {formatDate(payment.createdAt)} ·{' '}
          {payment.branch?.name} · {payment.receivedByName}
        </p>
      </div>
      {!voided && payment.kind === 'installment' && can('payments.void') && <VoidPaymentModal payment={payment} />}
    </li>
  );
}
