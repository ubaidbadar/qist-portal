import { FileText } from 'lucide-react';
import type { Contract } from '@shop/shared';
import { EmptyState } from '../../ui';
import usePagedList from '../../hooks/usePagedList';
import DataTable from '../../shared/data_table';
import ListSkeleton from '../../shared/list_skeleton';
import QueryView from '../../shared/query_view';
import SectionHeader from '../../shared/section_header';
import { contractColumns } from './contract_columns';
import NewContractButton from './new_contract_button';
import { CONTRACTS_KEY } from './queries';

/** A customer's contracts at every branch, on their profile page. */
export default function CustomerContracts({ customerId }: { customerId: string }) {
  const list = usePagedList<Contract>(CONTRACTS_KEY, '/contracts', { customerId });

  return (
    <section className="space-y-4">
      <SectionHeader title="Contracts" action={<NewContractButton customerId={customerId} />} />
      <QueryView query={{ ...list, data: list.rows }} skeleton={<ListSkeleton rows={2} />}>
        {(rows) => (
          <DataTable
            rows={rows}
            columns={contractColumns({ showBranch: true, showCustomer: false })}
            rowKey={(contract) => contract._id}
            rowHref={(contract) => `/contracts/${contract._id}`}
            hasMore={list.hasNextPage}
            loadingMore={list.isFetchingNextPage}
            onLoadMore={list.loadMore}
            empty={<EmptyState icon={FileText} title="No contracts yet" description="Sell this customer a phone on installments." />}
          />
        )}
      </QueryView>
    </section>
  );
}
