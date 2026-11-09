import { FileText } from 'lucide-react';
import type { Contract } from '@shop/shared';
import { EmptyState } from '../../ui';
import DataTable from '../../shared/data_table';
import SectionHeader from '../../shared/section_header';
import { contractColumns } from './contract_columns';
import NewContractButton from './new_contract_button';

/** A customer's contracts at every branch, on their profile page. */
export default function CustomerContracts({ customerId, contracts, hasMore, loadingMore, onLoadMore }: {
  customerId: string; contracts: Contract[]; hasMore: boolean; loadingMore: boolean; onLoadMore: () => void;
}) {

  return (
    <section className="space-y-4">
      <SectionHeader title="Contracts" action={<NewContractButton customerId={customerId} />} />

          <DataTable
            rows={contracts}
            columns={contractColumns({ showBranch: true, showCustomer: false })}
            rowKey={(contract) => contract._id}
            rowHref={(contract) => `/contracts/${contract._id}`}
            hasMore={hasMore}
            loadingMore={loadingMore}
            onLoadMore={onLoadMore}
            empty={<EmptyState icon={FileText} title="No contracts yet" description="Sell this customer a phone on installments." />}
          />

    </section>
  );
}
