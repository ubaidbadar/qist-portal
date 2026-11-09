import { useParams } from 'react-router-dom';
import { useInfiniteQuery } from '@tanstack/react-query';
import { formatCnic, formatMobile, type Customer } from '@shop/shared';
import { Card, Skeleton } from '../../ui';
import { useCan } from '../../auth';
import DetailList from '../../shared/detail_list';
import Page from '../../shared/page';
import QueryView from '../../shared/query_view';
import { formatDate } from '../../utils/dates';
import CustomerDrawer from './customer_drawer';
import CustomerContracts from '../contracts/customer_contracts';
import DeleteCustomerAction from './delete_customer_action';
import { customerOverviewQuery } from './queries';

/** One customer's profile, guarantors and contracts at every branch. */
export default function CustomerPage() {
  const { customerId = '' } = useParams();
  const query = useInfiniteQuery(customerOverviewQuery(customerId));
  const can = useCan();
  const customer = query.data?.pages[0].customer;

  return (
    <Page
      title={customer?.fullName ?? 'Customer'}
      breadcrumbs={[{ label: 'Customers', to: '/customers' }, { label: customer?.fullName ?? 'Customer' }]}
      actions={
        customer && (
          <>
            {can('customers.delete') && <DeleteCustomerAction customer={customer} />}
            <CustomerDrawer customer={customer} />
          </>
        )
      }
    >
      <QueryView query={query} skeleton={<Skeleton className="h-64 w-full" />}>
        {(loaded) => (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <ProfileCard customer={loaded.pages[0].customer} />
              <GuarantorsCard customer={loaded.pages[0].customer} />
            </div>
            <CustomerContracts customerId={customerId} contracts={loaded.pages.flatMap((page) => page.contracts.items)}
              hasMore={query.hasNextPage} loadingMore={query.isFetchingNextPage} onLoadMore={() => void query.fetchNextPage()} />
          </div>
        )}
      </QueryView>
    </Page>
  );
}

function ProfileCard({ customer }: { customer: Customer }) {
  return (
    <Card className="lg:col-span-2">
      <h2 className="mb-4 text-base font-semibold text-ink">Profile</h2>
      <DetailList
        items={[
          { label: 'Father or husband name', value: customer.fatherName },
          { label: 'CNIC', value: formatCnic(customer.cnic) },
          { label: 'Mobile', value: formatMobile(customer.phone) },
          { label: 'Second mobile', value: formatMobile(customer.altPhone) },
          { label: 'Address', value: customer.address },
          { label: 'Home branch', value: customer.homeBranch?.name },
          { label: 'Customer since', value: formatDate(customer.createdAt) },
          { label: 'Notes', value: customer.notes },
        ]}
      />
    </Card>
  );
}

function GuarantorsCard({ customer }: { customer: Customer }) {
  return (
    <Card>
      <h2 className="mb-4 text-base font-semibold text-ink">Guarantors</h2>
      {customer.guarantors.length === 0 ? (
        <p className="text-sm text-muted">None added. Edit the customer to add up to two.</p>
      ) : (
        <ul className="space-y-4">
          {customer.guarantors.map((guarantor) => (
            <li key={guarantor.cnic} className="text-sm">
              <p className="font-medium text-ink">
                {guarantor.fullName}
                {guarantor.relation && <span className="font-normal text-muted"> · {guarantor.relation}</span>}
              </p>
              <p className="tabular-nums text-muted">
                {formatCnic(guarantor.cnic)} · {formatMobile(guarantor.phone)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
