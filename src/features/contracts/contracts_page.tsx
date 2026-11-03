import { useSearchParams } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { CONTRACT_STATUSES, type Contract } from '@shop/shared';
import { EmptyState, Select } from '../../ui';
import { ALL_BRANCHES, useActiveBranch } from '../../auth';
import usePagedList from '../../hooks/usePagedList';
import DataTable from '../../shared/data_table';
import ListSkeleton from '../../shared/list_skeleton';
import Page from '../../shared/page';
import QueryView from '../../shared/query_view';
import { contractColumns } from './contract_columns';
import NewContractButton from './new_contract_button';
import { CONTRACTS_KEY } from './queries';

const ALL = '';
const STATUS_LABELS = { active: 'Active', completed: 'Completed', defaulted: 'Defaulted', cancelled: 'Cancelled' } as const;
const STATUS_OPTIONS = [{ value: ALL, label: 'All contracts' }, ...CONTRACT_STATUSES.map((status) => ({ value: status, label: STATUS_LABELS[status] }))];

/** Sales of the branch chosen in the switcher (owners can see all branches). The status filter lives in the URL. */
export default function ContractsPage() {
  const { branchId } = useActiveBranch();
  const [params, setParams] = useSearchParams();
  const status = params.get('status') ?? ALL;
  const allBranches = branchId === ALL_BRANCHES;
  const list = usePagedList<Contract>(CONTRACTS_KEY, '/contracts', { branchId: allBranches ? undefined : branchId, status: status || undefined });

  return (
    <Page title="Contracts" actions={<NewContractButton />}>
      <div className="space-y-4">
        <div className="sm:w-56">
          <Select aria-label="Status" options={STATUS_OPTIONS} value={status} onChange={(event) => setParams(event.target.value ? { status: event.target.value } : {}, { replace: true })} />
        </div>
        <QueryView query={{ ...list, data: list.rows }} skeleton={<ListSkeleton rows={5} />}>
          {(rows) => (
            <DataTable
              rows={rows}
              columns={contractColumns({ showBranch: allBranches, showCustomer: true })}
              rowKey={(contract) => contract._id}
              rowHref={(contract) => `/contracts/${contract._id}`}
              hasMore={list.hasNextPage}
              loadingMore={list.isFetchingNextPage}
              onLoadMore={list.loadMore}
              empty={<EmptyState icon={FileText} title="No contracts here yet" description="Sell a phone on installments to create the first one." action={<NewContractButton />} />}
            />
          )}
        </QueryView>
      </div>
    </Page>
  );
}
