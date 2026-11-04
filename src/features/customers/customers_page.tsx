import { Link, useSearchParams } from 'react-router-dom';
import { Search, SearchX, Users } from 'lucide-react';
import { formatCnic, formatMobile, type Customer } from '@shop/shared';
import { EmptyState, Input } from '../../ui';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import usePagedList from '../../hooks/usePagedList';
import DataTable, { type Column } from '../../shared/data_table';
import ListSkeleton from '../../shared/list_skeleton';
import Page from '../../shared/page';
import QueryView from '../../shared/query_view';
import { formatDate } from '../../utils/dates';
import CustomerDrawer from './customer_drawer';
import { CUSTOMERS_KEY } from './queries';

const COLUMNS: Column<Customer>[] = [
  {
    header: 'Customer',
    cell: (customer) => (
      <Link to={`/customers/${customer._id}`} className="rounded-chip font-medium text-ink hover:underline">
        {customer.fullName}
      </Link>
    ),
  },
  { header: 'CNIC', cell: (customer) => <span className="tabular-nums">{formatCnic(customer.cnic)}</span> },
  { header: 'Mobile', cell: (customer) => <span className="tabular-nums">{formatMobile(customer.phone)}</span> },
  { header: 'Home branch', cell: (customer) => customer.homeBranch?.name ?? '–' },
  { header: 'Added', cell: (customer) => formatDate(customer.createdAt), hideOnMobile: true },
];

/** Every customer of the retailer, whichever branch they came from. The search lives in the URL. */
export default function CustomersPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const search = useDebouncedValue(q.trim());
  const list = usePagedList<Customer>(CUSTOMERS_KEY, '/customers', { q: search || undefined });

  return (
    <Page title="Customers" description="Find customer records and open their installment history." actions={<CustomerDrawer />}>
      <div className="space-y-4">
        <Input
          icon={Search}
          label="Search customers"
          placeholder="Search by name, CNIC or mobile"
          value={q}
          onChange={(event) => setParams(event.target.value ? { q: event.target.value } : {}, { replace: true })}
        />
        <QueryView query={{ ...list, data: list.rows }} skeleton={<ListSkeleton rows={5} />}>
          {(rows) => (
            <DataTable
              rows={rows}
              columns={COLUMNS}
              rowKey={(customer) => customer._id}
              rowHref={(customer) => `/customers/${customer._id}`}
              hasMore={list.hasNextPage}
              loadingMore={list.isFetchingNextPage}
              onLoadMore={list.loadMore}
              empty={
                search ? (
                  <EmptyState icon={SearchX} title="No matching customers" description={`Nobody matches “${search}”. Check the spelling, or search by CNIC or mobile.`} />
                ) : (
                  <EmptyState icon={Users} title="No customers yet" description="Add a customer before selling them a phone on installments." action={<CustomerDrawer />} />
                )
              }
            />
          )}
        </QueryView>
      </div>
    </Page>
  );
}
