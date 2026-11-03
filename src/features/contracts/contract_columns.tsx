import { Link } from 'react-router-dom';
import type { Contract } from '@shop/shared';
import type { Column } from '../../shared/data_table';
import { scheduleLabel } from '../../shared/labels';
import MoneyText from '../../shared/money_text';
import StatusBadge from '../../shared/status_badge';
import { formatDate } from '../../utils/dates';

/** Columns shared by the contracts list and a customer's contracts. */
export function contractColumns({ showBranch, showCustomer }: { showBranch: boolean; showCustomer: boolean }): Column<Contract>[] {
  return [
    {
      header: showCustomer ? 'Customer' : 'Phone',
      cell: (contract) => (
        <Link to={`/contracts/${contract._id}`} className="rounded-chip font-medium text-ink hover:underline">
          {showCustomer ? contract.customerName : contract.deviceLabel}
        </Link>
      ),
    },
    ...(showCustomer ? [{ header: 'Phone', cell: (contract: Contract) => contract.deviceLabel }] : []),
    ...(showBranch ? [{ header: 'Branch', cell: (contract: Contract) => contract.branch?.name ?? '–' }] : []),
    { header: 'Installments', cell: (contract) => scheduleLabel(contract.count, contract.frequency) },
    { header: 'Total', cell: (contract) => <MoneyText amount={contract.totalPayable} />, className: 'text-right' },
    { header: 'Status', cell: (contract) => <StatusBadge status={contract.status} /> },
    { header: 'Sold', cell: (contract) => formatDate(contract.createdAt), hideOnMobile: true },
  ];
}
