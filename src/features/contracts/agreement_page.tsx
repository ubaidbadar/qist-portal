import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Printer } from 'lucide-react';
import { DEFAULT_GRACE_DAYS, formatCnic, formatMobile, type ContractWithSchedule, type Customer } from '@shop/shared';
import { Button, Skeleton } from '../../ui';
import { useMe } from '../../auth';
import DetailList from '../../shared/detail_list';
import { scheduleLabel } from '../../shared/labels';
import MoneyText from '../../shared/money_text';
import QueryView from '../../shared/query_view';
import { formatDate } from '../../utils/dates';
import { customerQuery } from '../customers/queries';
import { contractQuery } from './queries';
import ScheduleTable from './schedule_table';

/** The installment agreement, laid out for paper: print it, sign it, keep a copy. */
export default function AgreementPage() {
  const { contractId = '' } = useParams();
  const contract = useQuery(contractQuery(contractId));

  return (
    <main className="mx-auto max-w-3xl bg-surface px-6 py-8 text-sm text-body print:max-w-none print:p-0">
      <div className="mb-6 flex justify-between print:hidden">
        <Button as={Link} to={`/contracts/${contractId}`} variant="ghost" icon={ArrowLeft}>Back</Button>
        <Button icon={Printer} onClick={() => window.print()}>Print</Button>
      </div>
      <QueryView query={contract} skeleton={<Skeleton className="h-[40rem] w-full" />}>
        {(loaded) => <AgreementForCustomer contract={loaded} />}
      </QueryView>
    </main>
  );
}

/** The agreement names the customer in full (address, guarantors), so it loads their profile too. */
function AgreementForCustomer({ contract }: { contract: ContractWithSchedule }) {
  const customer = useQuery(customerQuery(contract.customerId));
  return (
    <QueryView query={customer} skeleton={<Skeleton className="h-[40rem] w-full" />}>
      {(loaded) => <Agreement contract={contract} customer={loaded} />}
    </QueryView>
  );
}

function Agreement({ contract, customer }: { contract: ContractWithSchedule; customer: Customer }) {
  const { org } = useMe();

  return (
    <article className="space-y-6">
      <header className="border-b border-border pb-4 text-center">
        <h1 className="text-xl font-semibold text-ink">{org.name}</h1>
        <p className="text-muted">{contract.branch?.name} · {formatDate(contract.createdAt)}</p>
        <p className="mt-3 text-base font-semibold text-ink">Installment Sale Agreement</p>
      </header>

      <section className="space-y-3">
        <h2 className="font-semibold text-ink">Customer</h2>
        <DetailList
          items={[
            { label: 'Name', value: customer.fullName },
            { label: 'Father or husband name', value: customer.fatherName },
            { label: 'CNIC', value: formatCnic(customer.cnic) },
            { label: 'Mobile', value: formatMobile(customer.phone) },
            { label: 'Address', value: customer.address },
          ]}
        />
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold text-ink">Phone and terms</h2>
        <DetailList
          items={[
            { label: 'Phone', value: contract.deviceLabel },
            { label: 'IMEI', value: contract.imeis.join(', ') },
            { label: 'Cash price', value: <MoneyText amount={contract.cashPrice} /> },
            { label: 'Down payment (paid today)', value: <MoneyText amount={contract.downPayment} /> },
            { label: 'Installments', value: scheduleLabel(contract.count, contract.frequency) },
            { label: 'Total payable in installments', value: <MoneyText amount={contract.totalPayable} /> },
          ]}
        />
        <ScheduleTable installments={contract.installments.map(({ number, dueDate, amount }) => ({ number, dueDate, amount }))} />
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold text-ink">Terms</h2>
        <ol className="list-decimal space-y-1.5 pl-5">
          <li>The phone remains the property of {org.name} until every installment is paid in full.</li>
          <li>Installments are due on the dates above and can be paid at any {org.name} branch, against a receipt.</li>
          <li>
            <strong className="text-ink">Phone lock.</strong> If an installment remains unpaid more than {DEFAULT_GRACE_DAYS} days after its due date,
            {' '}{org.name} may lock the phone remotely. It is unlocked once the overdue amount is paid. Emergency calls remain available while it is
            locked.
          </li>
          <li>Until fully paid, the customer will not reset or reflash the phone or remove the shop's software from it.</li>
          <li>The guarantors below are responsible for any installment the customer fails to pay.</li>
        </ol>
      </section>

      <section className="grid grid-cols-2 gap-x-8 gap-y-10 pt-8 sm:grid-cols-3">
        <Signature label={`Customer: ${customer.fullName}`} />
        {customer.guarantors.map((guarantor) => (
          <Signature key={guarantor.cnic} label={`Guarantor: ${guarantor.fullName} (${formatCnic(guarantor.cnic)})`} />
        ))}
        <Signature label={`For ${org.name}`} />
      </section>
    </article>
  );
}

function Signature({ label }: { label: string }) {
  return <p className="border-t border-ink pt-1 text-xs text-muted">{label}</p>;
}
