import { Link } from 'react-router-dom';
import { formatCnic, type ContractWithSchedule } from '@shop/shared';
import { Card } from '../../ui';
import DetailList from '../../shared/detail_list';
import { scheduleLabel } from '../../shared/labels';
import { markupBasisLabel } from './markup_basis';
import MoneyText from '../../shared/money_text';
import StatusBadge from '../../shared/status_badge';
import { formatDate } from '../../utils/dates';

/** Keep customer, phone and price details together without squeezing the schedule. */
export default function ContractInfoCard({ contract }: { contract: ContractWithSchedule }) {
  return (
    <Card className="min-w-0 space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-ink">Contract details</h2>
        <StatusBadge status={contract.status} />
      </div>
      <section aria-label="Sale details">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Customer & phone</h3>
        <DetailList items={[
          { label: 'Customer', value: <Link to={`/customers/${contract.customerId}`} className="font-semibold text-accent hover:underline">{contract.customerName}</Link> },
          { label: 'Phone', value: contract.deviceLabel },
          { label: 'CNIC', value: formatCnic(contract.customerCnic) },
          { label: 'IMEI', value: contract.imeis.join(', ') },
          { label: 'Branch', value: contract.branch?.name },
          { label: 'Sold on', value: formatDate(contract.createdAt) },
        ]} />
      </section>
      <section aria-label="Pricing details" className="border-t border-border pt-5">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Pricing & terms</h3>
        <DetailList items={[
          { label: 'Cash price', value: <MoneyText amount={contract.cashPrice} /> },
          { label: 'Down payment', value: <MoneyText amount={contract.downPayment} /> },
          { label: 'Markup calculated on', value: markupBasisLabel(contract.markupBasis) },
          { label: `Markup (${contract.markupPercent}%)`, value: <MoneyText amount={contract.markupAmount} /> },
          { label: 'Payment frequency', value: scheduleLabel(contract.count, contract.frequency) },
          ...(contract.lateFees ? [{ label: 'Late fees', value: <MoneyText amount={contract.lateFees} /> }] : []),
        ]} />
      </section>
    </Card>
  );
}
