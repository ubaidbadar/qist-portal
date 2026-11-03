import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import type { CommandStatus, DeviceCommand } from '@shop/shared';
import { EmptyState } from '../../ui';
import usePagedList from '../../hooks/usePagedList';
import DataTable, { type Column } from '../../shared/data_table';
import ListSkeleton from '../../shared/list_skeleton';
import QueryView from '../../shared/query_view';
import StatusBadge from '../../shared/status_badge';
import { formatDate } from '../../utils/dates';
import CommandActions from './command_actions';
import { COMMANDS_KEY, LOCK_CENTER_REFRESH_MS } from './queries';

const TYPE_LABELS = { lock: 'Lock', unlock: 'Unlock', release: 'Release' } as const;

const COLUMNS: Column<DeviceCommand>[] = [
  { header: 'Customer', cell: (c) => <Link to={`/contracts/${c.contractId}`} className="font-medium text-ink hover:underline">{c.customerName}</Link> },
  { header: 'Phone', cell: (c) => c.deviceLabel },
  { header: 'Command', cell: (c) => <span className="font-medium">{TYPE_LABELS[c.type]}</span> },
  { header: 'Status', cell: (c) => <StatusBadge status={c.status} /> },
  { header: 'Why', cell: (c) => <span className="text-muted">{c.decisionReason || c.reason}</span>, hideOnMobile: true },
  { header: 'By', cell: (c) => `${c.requestedByName}${c.decidedByName ? ` → ${c.decidedByName}` : ''}`, hideOnMobile: true },
  { header: 'When', cell: (c) => formatDate(c.updatedAt), hideOnMobile: true },
  { header: '', cell: (c) => <CommandActions command={c} />, className: 'text-right' },
];

interface CommandListProps {
  status?: CommandStatus;
  branchId: string | undefined;
  emptyTitle: string;
  emptyText: string;
}

/** Lock commands at the user's branches, newest first, optionally one status only. Refreshes on its own. */
export default function CommandList({ status, branchId, emptyTitle, emptyText }: CommandListProps) {
  const list = usePagedList<DeviceCommand>(COMMANDS_KEY, '/commands', { status, branchId }, { refetchInterval: LOCK_CENTER_REFRESH_MS });

  return (
    <QueryView query={{ ...list, data: list.rows }} skeleton={<ListSkeleton rows={3} />}>
      {(rows) => (
        <DataTable
          rows={rows}
          columns={COLUMNS}
          rowKey={(c) => c._id}
          hasMore={list.hasNextPage}
          loadingMore={list.isFetchingNextPage}
          onLoadMore={list.loadMore}
          empty={<EmptyState icon={ShieldCheck} title={emptyTitle} description={emptyText} />}
        />
      )}
    </QueryView>
  );
}
