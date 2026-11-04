import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { FileText } from 'lucide-react';
import type { Contract } from '@shop/shared';
import { Card, Skeleton } from '../../ui';
import QueryView from '../../shared/query_view';
import StatusBadge from '../../shared/status_badge';
import { formatDate } from '../../utils/dates';
import NewContractButton from '../contracts/new_contract_button';
import { dashboardContractsQuery } from './queries';

/** Recent sales show useful activity even on days without collections or overdue installments. */
export default function ContractsPanel({ branchId }: { branchId: string | undefined }) {
  const contracts = useQuery(dashboardContractsQuery(branchId));

  return (
    <Card padding="none" className="min-w-0 overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold text-ink">Recent contracts</h2>
        <Link to="/contracts" className="text-sm font-semibold text-accent hover:underline">View all</Link>
      </div>
      <QueryView query={contracts} skeleton={<Skeleton className="h-48 rounded-card" />}>
        {(page) => page.items.length ? (
          <ul className="divide-y divide-border">
            {page.items.map((contract: Contract) => (
              <li key={contract._id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 py-3.5 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_auto]">
                <div className="min-w-0">
                  <Link to={`/contracts/${contract._id}`} className="block truncate text-sm font-semibold text-ink hover:text-accent">
                    {contract.customerName}
                  </Link>
                  <p className="mt-0.5 truncate text-xs text-muted">{contract.deviceLabel}</p>
                </div>
                <span className="hidden text-sm text-muted sm:block">{formatDate(contract.createdAt)}</span>
                <StatusBadge status={contract.status} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center px-6 py-9 text-center">
            <span className="mb-3 grid size-11 place-items-center rounded-pill bg-border text-muted">
              <FileText size={21} aria-hidden="true" />
            </span>
            <p className="font-semibold text-ink">No contracts yet</p>
            <p className="mt-1 mb-4 max-w-sm text-sm text-muted">Start a sale, choose a customer and phone, and set the installment terms.</p>
            <NewContractButton />
          </div>
        )}
      </QueryView>
    </Card>
  );
}
