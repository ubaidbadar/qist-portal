import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Lock, PartyPopper } from 'lucide-react';
import type { OverdueAccount } from '@shop/shared';
import { Button, EmptyState } from '../../ui';
import { useCan } from '../../auth';
import DataTable, { type Column } from '../../shared/data_table';
import ListSkeleton from '../../shared/list_skeleton';
import MoneyText from '../../shared/money_text';
import QueryView from '../../shared/query_view';
import StatusBadge from '../../shared/status_badge';
import { formatDate } from '../../utils/dates';
import PauseModal from './pause_modal';
import { overdueQuery } from './queries';
import ReasonModal from './reason_modal';

function OverdueActions({ account }: { account: OverdueAccount }) {
  const can = useCan();
  if (!can('locks.manage')) return null;
  return (
    <div className="flex justify-end gap-1">
      {!account.openCommand && account.lockState === 'unlocked' && (
        <ReasonModal
          title={`Lock ${account.customerName}'s phone?`}
          consequence={<>The {account.deviceLabel} will be locked as soon as it is reachable. It unlocks when the overdue amount is paid; emergency calls keep working.</>}
          confirmText="Lock phone"
          confirmVariant="danger"
          url={`/contracts/${account.contractId}/lock`}
          done="Lock queued"
          trigger={(open) => <Button size="sm" variant="danger" icon={Lock} onClick={open}>Lock</Button>}
        />
      )}
      <PauseModal contractId={account.contractId} customerName={account.customerName} />
    </div>
  );
}

const COLUMNS: Column<OverdueAccount>[] = [
  { header: 'Customer', cell: (a) => <Link to={`/contracts/${a.contractId}`} className="font-medium text-ink hover:underline">{a.customerName}</Link> },
  { header: 'Phone', cell: (a) => a.deviceLabel },
  { header: 'Days late', cell: (a) => <span className="font-semibold tabular-nums text-danger-600">{a.daysOverdue}</span>, className: 'text-right' },
  { header: 'Overdue', cell: (a) => <MoneyText amount={a.overdueAmount} />, className: 'text-right' },
  {
    header: 'Lock',
    cell: (a) =>
      a.openCommand ? <StatusBadge status={a.openCommand.status} /> : a.autoLockPausedUntil ? <span className="text-xs text-muted">Paused to {formatDate(a.autoLockPausedUntil)}</span> : <StatusBadge status={a.lockState} />,
  },
  { header: '', cell: (a) => <OverdueActions account={a} />, className: 'text-right' },
];

/** Every active contract with something past due, most days late first. */
export default function OverdueList({ branchId }: { branchId: string | undefined }) {
  const query = useQuery(overdueQuery(branchId));
  return (
    <QueryView query={query} skeleton={<ListSkeleton rows={4} />}>
      {(accounts) => (
        <DataTable rows={accounts} columns={COLUMNS} rowKey={(a) => a.contractId} empty={<EmptyState icon={PartyPopper} title="Nobody is late" description="Every customer here is up to date with their installments." />} />
      )}
    </QueryView>
  );
}
