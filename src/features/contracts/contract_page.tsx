import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Printer } from 'lucide-react';
import { formatCnic, type ContractWithSchedule } from '@shop/shared';
import { Alert, Button, Card, Skeleton } from '../../ui';
import { useCan } from '../../auth';
import DetailList from '../../shared/detail_list';
import { scheduleLabel } from '../../shared/labels';
import MoneyText from '../../shared/money_text';
import Page from '../../shared/page';
import QueryView from '../../shared/query_view';
import StatusBadge from '../../shared/status_badge';
import { formatDate } from '../../utils/dates';
import ContractLockPanel from '../locks/contract_lock_panel';
import LedgerCard from '../payments/ledger_card';
import RecordPaymentModal from '../payments/record_payment_modal';
import CancelContractModal from './cancel_contract_modal';
import { contractQuery } from './queries';
import ScheduleTable from './schedule_table';

export default function ContractPage() {
  const { contractId = '' } = useParams();
  const query = useQuery(contractQuery(contractId));
  const can = useCan();
  const contract = query.data;
  const title = contract ? `${contract.customerName} · ${contract.deviceLabel}` : 'Contract';

  return (
    <Page
      title={title}
      breadcrumbs={[{ label: 'Contracts', to: '/contracts' }, { label: title }]}
      actions={
        contract && (
          <>
            {contract.status === 'active' && contract.paidTotal === 0 && can('contracts.cancel') && <CancelContractModal contract={contract} />}
            <Button as={Link} to={`/contracts/${contract._id}/agreement`} variant="outline" icon={Printer}>
              Agreement
            </Button>
            {contract.status === 'active' && can('payments.record') && <RecordPaymentModal contract={contract} />}
          </>
        )
      }
    >
      <QueryView query={query} skeleton={<Skeleton className="h-96 w-full" />}>
        {(loaded) => <ContractDetails contract={loaded} />}
      </QueryView>
    </Page>
  );
}

function ContractDetails({ contract }: { contract: ContractWithSchedule }) {
  return (
    <div className="space-y-6">
      {contract.status === 'cancelled' && <Alert tone="warning" title="Cancelled">{contract.cancelReason}</Alert>}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-ink">Terms</h2>
              <StatusBadge status={contract.status} />
            </div>
            <DetailList
              items={[
                { label: 'Customer', value: <Link to={`/customers/${contract.customerId}`} className="text-accent hover:underline">{contract.customerName}</Link> },
                { label: 'CNIC', value: formatCnic(contract.customerCnic) },
                { label: 'Phone', value: contract.deviceLabel },
                { label: 'IMEI', value: contract.imeis.join(', ') },
                { label: 'Branch', value: contract.branch?.name },
                { label: 'Sold on', value: formatDate(contract.createdAt) },
                { label: 'Cash price', value: <MoneyText amount={contract.cashPrice} /> },
                { label: 'Down payment', value: <MoneyText amount={contract.downPayment} /> },
                { label: `Markup (${contract.markupPercent}%)`, value: <MoneyText amount={contract.markupAmount} /> },
                { label: 'Installments', value: scheduleLabel(contract.count, contract.frequency) },
                { label: 'Total in installments', value: <MoneyText amount={contract.totalPayable} className="font-semibold" /> },
                { label: 'Paid so far', value: <MoneyText amount={contract.paidTotal} /> },
                ...(contract.lateFees ? [{ label: 'Late fees', value: <MoneyText amount={contract.lateFees} /> }] : []),
              ]}
            />
          </Card>
          <ContractLockPanel contract={contract} />
        </div>
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <h2 className="mb-3 text-base font-semibold text-ink">Schedule</h2>
            <ScheduleTable installments={contract.installments} />
          </Card>
          <LedgerCard contractId={contract._id} payments={contract.payments} />
        </div>
      </div>
    </div>
  );
}
