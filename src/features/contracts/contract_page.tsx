import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Printer, QrCode } from 'lucide-react';
import type { ContractWithSchedule } from '@shop/shared';
import { Alert, Button, Card, Modal, Skeleton } from '../../ui';
import { useCan } from '../../auth';
import Page from '../../shared/page';
import QueryView from '../../shared/query_view';
import ContractLockPanel from '../locks/contract_lock_panel';
import LedgerCard from '../payments/ledger_card';
import RecordPaymentModal from '../payments/record_payment_modal';
import EnrollmentPanel from '../inventory/enrollment_panel';
import CancelContractModal from './cancel_contract_modal';
import ContractOverview from './contract_overview';
import ContractInfoCard from './contract_info_card';
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
            {contract.status === 'active' && can('devices.enroll') && (
              <Modal
                title={`Set up ${contract.deviceLabel}`}
                component={({ open }) => <Button variant="outline" icon={QrCode} onClick={open}>Phone setup QR</Button>}
              >
                <EnrollmentPanel deviceId={contract.deviceId} deviceLabel={contract.deviceLabel} />
              </Modal>
            )}
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
    <div className="space-y-5">
      {contract.status === 'cancelled' && <Alert tone="warning" title="Cancelled">{contract.cancelReason}</Alert>}
      <ContractOverview contract={contract} />
      <ContractLockPanel contract={contract} />
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.7fr)_minmax(300px,1fr)]">
        <div className="min-w-0 space-y-5">
          <Card padding="none" className="overflow-hidden">
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-base font-semibold text-ink">Installment schedule</h2>
              <p className="mt-1 text-sm text-muted">Due dates, received amounts and payment status.</p>
            </div>
            <div className="overflow-x-auto px-5 py-3">
              <ScheduleTable installments={contract.installments} />
            </div>
          </Card>
          <LedgerCard contractId={contract._id} payments={contract.payments} />
        </div>
        <ContractInfoCard contract={contract} />
      </div>
    </div>
  );
}
