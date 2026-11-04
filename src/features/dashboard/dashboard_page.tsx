import { useQuery } from '@tanstack/react-query';
import { AlertTriangle, CalendarClock, Wallet } from 'lucide-react';
import { todayInShops } from '@shop/shared';
import { Skeleton, StatCard } from '../../ui';
import { ALL_BRANCHES, useActiveBranch } from '../../auth';
import MoneyText from '../../shared/money_text';
import Page from '../../shared/page';
import QueryView from '../../shared/query_view';
import NewContractButton from '../contracts/new_contract_button';
import AttentionPanel from './attention_panel';
import ContractsPanel from './contracts_panel';
import PaymentsPanel from './payments_panel';
import { dashboardQuery } from './queries';

/** All dashboard panels share one authenticated query and one MongoDB snapshot. */
export default function DashboardPage() {
  const { branchId } = useActiveBranch();
  const branch = branchId === ALL_BRANCHES ? undefined : branchId;
  const date = todayInShops();
  const query = useQuery(dashboardQuery(date, branch));

  return (
    <Page title="Dashboard" actions={<NewContractButton />}>
      <div className="space-y-5">
        <p className="-mt-3 text-sm text-muted">Your collections, overdue installments and recent sales in one place.</p>
        <QueryView query={query} skeleton={<Skeleton className="h-96 w-full rounded-card" />}>
          {(snapshot) => (
            <>
              <section aria-label="Business overview" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard
                  label="Collected today"
                  value={<MoneyText amount={snapshot.collections.total} />}
                  hint={`${snapshot.collections.count} payment receipts`}
                  icon={Wallet}
                  tone="success"
                />
                <StatCard
                  label="Overdue accounts"
                  value={snapshot.overdue.length}
                  hint="Accounts needing attention"
                  icon={AlertTriangle}
                  tone="danger"
                />
                <StatCard
                  label="Overdue balance"
                  value={<MoneyText amount={snapshot.overdue.reduce((sum, account) => sum + account.overdueAmount, 0)} />}
                  hint="Across the selected branch"
                  icon={CalendarClock}
                  tone="warning"
                />
              </section>
              <div className="mt-5 grid items-stretch gap-5 lg:grid-cols-2">
                <AttentionPanel accounts={snapshot.overdue} />
                <PaymentsPanel payments={snapshot.payments} />
              </div>
              <div className="mt-5">
                <ContractsPanel contracts={snapshot.contracts} />
              </div>
            </>
          )}
        </QueryView>
      </div>
    </Page>
  );
}
