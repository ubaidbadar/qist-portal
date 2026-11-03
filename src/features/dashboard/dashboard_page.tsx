import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, Banknote, CalendarCheck, FileText, Receipt, Wallet } from 'lucide-react';
import { todayInShops, type OverdueAccount, type Payment } from '@shop/shared';
import { Badge, Button, Card, Skeleton, StatCard } from '../../ui';
import { ALL_BRANCHES, useActiveBranch } from '../../auth';
import MoneyText from '../../shared/money_text';
import Page from '../../shared/page';
import QueryView from '../../shared/query_view';
import StatusBadge from '../../shared/status_badge';
import { formatDate } from '../../utils/dates';
import NewContractButton from '../contracts/new_contract_button';
import CustomerDrawer from '../customers/customer_drawer';
import { overdueQuery } from '../locks/queries';
import { collectionsQuery } from '../payments/queries';
import PaymentLauncher from '../payments/payment_launcher';
import { dashboardPaymentsQuery } from './queries';

/** Real collections and overdue status only; the API has no fabricated cross-org dashboard counters. */
export default function DashboardPage() {
  const { branchId } = useActiveBranch();
  const branch = branchId === ALL_BRANCHES ? undefined : branchId;
  const date = todayInShops();
  const collections = useQuery(collectionsQuery(date, branch));
  const overdue = useQuery(overdueQuery(branch));
  const payments = useQuery(dashboardPaymentsQuery(date, branch));

  return (
    <Page
      title="Dashboard"
      actions={<div className="flex flex-wrap gap-2"><NewContractButton /><CustomerDrawer /></div>}
    >
      <div className="space-y-6">
        <p className="-mt-4 text-sm text-muted">Here is what needs your attention today.</p>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <QueryView query={collections} skeleton={<Skeleton className="h-36 rounded-card" />}>
            {(data) => (
              <StatCard
                label="Collected today"
                value={<MoneyText amount={data.total} />}
                hint={`${data.count} payment receipts`}
                icon={Wallet}
                tone="success"
              />
            )}
          </QueryView>
          <QueryView query={overdue} skeleton={<Skeleton className="h-36 rounded-card" />}>
            {(accounts) => (
              <StatCard
                label="Overdue accounts"
                value={accounts.length}
                hint="Installment contracts needing attention"
                icon={AlertTriangle}
                tone="danger"
              />
            )}
          </QueryView>
          <QueryView query={overdue} skeleton={<Skeleton className="h-36 rounded-card" />}>
            {(accounts) => (
              <StatCard
                label="Overdue balance"
                value={<MoneyText amount={accounts.reduce((sum, item) => sum + item.overdueAmount, 0)} />}
                hint="Across the selected branch"
                icon={CalendarCheck}
                tone="warning"
              />
            )}
          </QueryView>
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(290px,1fr)]">
          <Card padding="none" className="overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-border p-5">
              <h2 className="text-lg font-bold text-ink">Needs attention</h2>
              <Link className="text-sm font-semibold text-accent hover:underline" to="/lock-center">View all</Link>
            </div>
            <QueryView query={overdue} skeleton={<Skeleton className="h-56 rounded-card" />}>
              {(accounts) => (
                accounts.length ? (
                  <ul className="divide-y divide-border">
                    {accounts.slice(0, 5).map((account: OverdueAccount) => (
                      <li key={account.contractId} className="flex flex-wrap items-center gap-3 px-5 py-4 sm:flex-nowrap">
                        <div className="min-w-0 flex-1">
                          <Link className="block truncate font-semibold text-ink hover:text-accent" to={`/contracts/${account.contractId}`}>{account.customerName}</Link>
                          <p className="truncate text-xs text-muted">{account.deviceLabel} · {account.daysOverdue} days overdue</p>
                        </div>
                        <div className="shrink-0 text-end">
                          <MoneyText amount={account.overdueAmount} className="font-semibold text-ink" />
                          <div className="mt-1">{account.openCommand ? <StatusBadge status={account.openCommand.status} /> : <StatusBadge status={account.lockState} />}</div>
                        </div>
                        <Button as={Link} size="sm" variant="outline" to={`/contracts/${account.contractId}`}>Review</Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="p-8 text-center text-sm text-muted">No overdue accounts right now.</p>
                )
              )}
            </QueryView>
          </Card>
          <div className="space-y-5">
            <Card className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-ink">Today's payments</h2>
                <Link className="text-sm font-semibold text-accent hover:underline" to="/payments">View all</Link>
              </div>
              <QueryView query={payments} skeleton={<Skeleton className="h-48 rounded-card" />}>
                {(page) => page.items.length ? (
                  <ul className="divide-y divide-border">
                    {page.items.map((payment: Payment) => (
                      <li key={payment._id} className="flex items-center justify-between gap-4 py-3 text-sm">
                        <div className="min-w-0">
                          <Link to={`/payments/${payment._id}/receipt`} className="block truncate font-semibold text-ink hover:text-accent">{payment.customerName}</Link>
                          <span className="text-xs text-muted">{formatDate(payment.createdAt)}</span>
                          {payment.voidedAt && <Badge variant="neutral" pill className="ms-2">Void</Badge>}
                        </div>
                        <MoneyText amount={payment.amount} className={payment.voidedAt ? 'shrink-0 line-through text-muted' : 'shrink-0 font-semibold text-success-800'} />
                      </li>
                    ))}
                  </ul>
                ) : <p className="py-6 text-center text-sm text-muted">No payments recorded today.</p>}
              </QueryView>
              <PaymentLauncher />
            </Card>
            <Card className="space-y-3">
              <h2 className="text-lg font-bold text-ink">Quick actions</h2>
              <Button as={Link} to="/contracts" variant="outline" icon={FileText} className="w-full">View contracts</Button>
              <Button as={Link} to="/payments" variant="outline" icon={Banknote} className="w-full">View collections</Button>
              <Button as={Link} to="/inventory" variant="outline" icon={Receipt} className="w-full">Manage phones</Button>
            </Card>
          </div>
        </div>
      </div>
    </Page>
  );
}
