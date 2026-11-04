import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CalendarClock, Wallet } from 'lucide-react';
import { todayInShops } from '@shop/shared';
import { Skeleton, StatCard } from '../../ui';
import { ALL_BRANCHES, useActiveBranch } from '../../auth';
import MoneyText from '../../shared/money_text';
import Page from '../../shared/page';
import QueryView from '../../shared/query_view';
import NewContractButton from '../contracts/new_contract_button';
import { overdueQuery } from '../locks/queries';
import { collectionsQuery } from '../payments/queries';
import AttentionPanel from './attention_panel';
import ContractsPanel from './contracts_panel';
import PaymentsPanel from './payments_panel';

/** An at-a-glance overview built only from live retailer data. */
export default function DashboardPage() {
  const { branchId } = useActiveBranch();
  const branch = branchId === ALL_BRANCHES ? undefined : branchId;
  const date = todayInShops();
  const collections = useQuery(collectionsQuery(date, branch));
  const overdue = useQuery(overdueQuery(branch));

  return (
    <Page title="Dashboard" actions={<NewContractButton />}>
      <div className="space-y-5">
        <p className="-mt-3 text-sm text-muted">Your collections, overdue installments and recent sales in one place.</p>

        <section aria-label="Business overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <QueryView query={collections} skeleton={<Skeleton className="h-32 w-full rounded-card" />}>
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
          <QueryView query={overdue} skeleton={<Skeleton className="h-32 w-full rounded-card" />}>
            {(accounts) => (
              <StatCard
                label="Overdue accounts"
                value={accounts.length}
                hint="Accounts needing attention"
                icon={AlertTriangle}
                tone="danger"
              />
            )}
          </QueryView>
          <QueryView query={overdue} skeleton={<Skeleton className="h-32 w-full rounded-card" />}>
            {(accounts) => (
              <StatCard
                label="Overdue balance"
                value={<MoneyText amount={accounts.reduce((sum, account) => sum + account.overdueAmount, 0)} />}
                hint="Across the selected branch"
                icon={CalendarClock}
                tone="warning"
              />
            )}
          </QueryView>
        </section>

        <div className="grid items-stretch gap-5 lg:grid-cols-2">
          <AttentionPanel branchId={branch} />
          <PaymentsPanel branchId={branch} date={date} />
        </div>

        <ContractsPanel branchId={branch} />
      </div>
    </Page>
  );
}
