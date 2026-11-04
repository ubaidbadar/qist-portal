import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import type { ContractWithSchedule } from '@shop/shared';
import { Alert, Card, Skeleton } from '../../ui';
import Page from '../../shared/page';
import QueryView from '../../shared/query_view';
import ContractLockPanel from '../locks/contract_lock_panel';
import LedgerCard from '../payments/ledger_card';
import ContractActions from './contract_actions';
import ContractOverview from './contract_overview';
import ContractInfoCard from './contract_info_card';
import { contractQuery } from './queries';
import ScheduleTable from './schedule_table';

export default function ContractPage() {
  const { contractId = '' } = useParams();
  const query = useQuery(contractQuery(contractId));
  const contract = query.data;
  const title = contract?.customerName ?? 'Contract';

  return (
    <Page
      title={title}
      description={contract?.deviceLabel}
      breadcrumbs={[{ label: 'Contracts', to: '/contracts' }, { label: 'Details' }]}
      actions={contract && <ContractActions contract={contract} />}
    >
      <QueryView query={query} skeleton={<Skeleton className="h-96 w-full" />}>
        {(loaded) => <ContractDetails contract={loaded} />}
      </QueryView>
    </Page>
  );
}

function ContractDetails({ contract }: { contract: ContractWithSchedule }) {
  return (
    <div className="space-y-5">
      {contract.status === 'cancelled' && <Alert tone="warning" title="Cancelled">{contract.cancelReason}</Alert>}
      <ContractOverview contract={contract} />
      <ContractLockPanel contract={contract} />
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]">
        <div className="order-2 min-w-0 space-y-5 lg:order-1">
          <Card padding="none" className="overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold text-ink">Installment schedule</h2>
              <p className="mt-1 text-sm text-muted">Due dates, received amounts and payment status.</p>
            </div>
            <div className="px-4 py-3 sm:px-5">
              <ScheduleTable installments={contract.installments} />
            </div>
          </Card>
          <LedgerCard contractId={contract._id} payments={contract.payments} />
        </div>
        <div className="order-1 min-w-0 lg:order-2">
          <ContractInfoCard contract={contract} />
        </div>
      </div>
    </div>
  );
}
