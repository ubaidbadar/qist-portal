import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2 } from 'lucide-react';
import type { OverdueAccount } from '@shop/shared';
import { Button, Card, Skeleton } from '../../ui';
import MoneyText from '../../shared/money_text';
import QueryView from '../../shared/query_view';
import StatusBadge from '../../shared/status_badge';
import { overdueQuery } from '../locks/queries';

/** Prioritize late accounts, but show a reassuring useful zero state. */
export default function AttentionPanel({ branchId }: { branchId: string | undefined }) {
  const overdue = useQuery(overdueQuery(branchId));

  return (
    <Card padding="none" className="flex min-w-0 flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold text-ink">Needs attention</h2>
        <Link to="/lock-center" className="text-sm font-semibold text-accent hover:underline">View all</Link>
      </div>
      <QueryView query={overdue} skeleton={<Skeleton className="h-56 rounded-card" />}>
        {(accounts) => accounts.length ? (
          <ul className="divide-y divide-border">
            {accounts.slice(0, 4).map((account: OverdueAccount) => (
              <li key={account.contractId} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <div className="min-w-0 flex-1">
                  <Link to={`/contracts/${account.contractId}`} className="block truncate text-sm font-semibold text-ink hover:text-accent">
                    {account.customerName}
                  </Link>
                  <p className="mt-0.5 truncate text-xs text-muted">{account.deviceLabel} · {account.daysOverdue} days late</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <MoneyText amount={account.overdueAmount} className="text-sm font-semibold text-ink" />
                  {account.openCommand ? <StatusBadge status={account.openCommand.status} /> : <StatusBadge status={account.lockState} />}
                </div>
                <Button as={Link} to={`/contracts/${account.contractId}`} size="sm" variant="outline">Review</Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex min-h-52 flex-col items-center justify-center px-6 py-8 text-center">
            <span className="mb-3 grid size-11 place-items-center rounded-pill bg-success-100 text-success-800">
              <CheckCircle2 size={21} aria-hidden="true" />
            </span>
            <p className="font-semibold text-ink">All caught up</p>
            <p className="mt-1 max-w-xs text-sm text-muted">No overdue installments need attention right now.</p>
          </div>
        )}
      </QueryView>
    </Card>
  );
}
