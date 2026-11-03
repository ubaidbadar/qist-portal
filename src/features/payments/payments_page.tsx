import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Banknote, Receipt, Wallet } from 'lucide-react';
import { todayInShops, type Collections, type Payment } from '@shop/shared';
import { Badge, Card, EmptyState, Input, StatCard } from '../../ui';
import { ALL_BRANCHES, useActiveBranch } from '../../auth';
import usePagedList from '../../hooks/usePagedList';
import DataTable, { type Column } from '../../shared/data_table';
import ListSkeleton from '../../shared/list_skeleton';
import MoneyText from '../../shared/money_text';
import Page from '../../shared/page';
import QueryView from '../../shared/query_view';
import { METHOD_LABELS } from './labels';
import PaymentLauncher from './payment_launcher';
import { collectionsQuery, PAYMENTS_KEY } from './queries';

const COLUMNS: Column<Payment>[] = [
  { header: 'Receipt', cell: (p) => <Link to={`/payments/${p._id}/receipt`} className="font-medium text-ink hover:underline">{p.receiptNumber}</Link> },
  { header: 'Customer', cell: (p) => <Link to={`/contracts/${p.contractId}`} className="hover:underline">{p.customerName}</Link> },
  { header: 'Amount', cell: (p) => <MoneyText amount={p.amount} className={p.voidedAt ? 'line-through opacity-60' : ''} />, className: 'text-right' },
  { header: 'Method', cell: (p) => METHOD_LABELS[p.method] },
  { header: 'Received by', cell: (p) => p.receivedByName, hideOnMobile: true },
  { header: 'Branch', cell: (p) => p.branch?.name ?? '–', hideOnMobile: true },
  { header: '', cell: (p) => p.voidedAt && <Badge variant="neutral" pill>Void</Badge> },
];

/** A day's takings (default today) at the branch in the switcher: totals to count the cash against, and each receipt. */
export default function PaymentsPage() {
  const { branchId } = useActiveBranch();
  const [params, setParams] = useSearchParams();
  const date = params.get('date') ?? todayInShops();
  const branch = branchId === ALL_BRANCHES ? undefined : branchId;
  const summary = useQuery(collectionsQuery(date, branch));
  const list = usePagedList<Payment>(PAYMENTS_KEY, '/payments', { date, branchId: branch });

  return (
    <Page title="Payments" actions={<div className="flex flex-wrap items-end gap-3"><PaymentLauncher /><Input type="date" aria-label="Day" value={date} max={todayInShops()} onChange={(e) => setParams(e.target.value ? { date: e.target.value } : {}, { replace: true })} /></div>}>
      <div className="space-y-6">
        <QueryView query={summary} skeleton={<ListSkeleton rows={1} />}>
          {(collections) => <CollectionsSummary collections={collections} />}
        </QueryView>
        <QueryView query={{ ...list, data: list.rows }} skeleton={<ListSkeleton rows={4} />}>
          {(rows) => (
            <DataTable
              rows={rows}
              columns={COLUMNS}
              rowKey={(p) => p._id}
              rowHref={(p) => `/payments/${p._id}/receipt`}
              hasMore={list.hasNextPage}
              loadingMore={list.isFetchingNextPage}
              onLoadMore={list.loadMore}
              empty={<EmptyState icon={Receipt} title="No payments this day" description="Payments are recorded from a contract's page." />}
            />
          )}
        </QueryView>
      </div>
    </Page>
  );
}

function CollectionsSummary({ collections }: { collections: Collections }) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <StatCard label="Collected" value={<MoneyText amount={collections.total} />} icon={Wallet} hint={`${collections.count} receipts, voids left out`} tone="success" />
      <Card>
        <p className="mb-2 flex items-center gap-2 text-sm text-muted"><Banknote size={16} aria-hidden="true" /> By method</p>
        <Breakdown rows={collections.byMethod.map((m) => ({ key: m.method, label: METHOD_LABELS[m.method], total: m.total }))} />
      </Card>
      <Card>
        <p className="mb-2 text-sm text-muted">By person</p>
        <Breakdown rows={collections.byStaff.map((s) => ({ key: s.userId, label: s.name, total: s.total }))} />
      </Card>
    </div>
  );
}

function Breakdown({ rows }: { rows: { key: string; label: string; total: number }[] }) {
  if (rows.length === 0) return <p className="text-sm text-muted">Nothing yet.</p>;
  return (
    <ul className="space-y-1 text-sm">
      {rows.map((row) => (
        <li key={row.key} className="flex justify-between gap-3">
          <span className="text-body">{row.label}</span>
          <MoneyText amount={row.total} className="text-ink" />
        </li>
      ))}
    </ul>
  );
}
