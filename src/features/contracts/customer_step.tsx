import { useState } from 'react';
import { Search, UsersRound } from 'lucide-react';
import { formatCnic, formatMobile, type Customer } from '@shop/shared';
import { EmptyState, Input } from '../../ui';
import { useCan } from '../../auth';
import CustomerDrawer from '../customers/customer_drawer';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import usePagedList from '../../hooks/usePagedList';
import ListSkeleton from '../../shared/list_skeleton';
import QueryView from '../../shared/query_view';
import { CUSTOMERS_KEY } from '../customers/queries';
import ChoiceList from './choice_list';

interface CustomerStepProps {
  selected: Customer | null;
  onSelect: (customer: Customer) => void;
}

/** Find or create a customer without leaving the new-contract workflow. */
export default function CustomerStep({ selected, onSelect }: CustomerStepProps) {
  const [q, setQ] = useState(selected?.fullName ?? '');
  const can = useCan();
  const search = useDebouncedValue(q.trim());
  const list = usePagedList<Customer>(CUSTOMERS_KEY, '/customers', { q: search || undefined });

  const onCreated = (customer: Customer) => {
    onSelect(customer);
    setQ(customer.fullName);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <Input
            icon={Search}
            label="Search customers"
            placeholder="Search by name, CNIC or mobile"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            autoFocus
          />
        </div>
        {can('customers.write') && <CustomerDrawer onCreated={onCreated} />}
      </div>
      <QueryView query={{ ...list, data: list.rows }} skeleton={<ListSkeleton rows={3} />}>
        {(customers) => customers.length === 0 ? (
          <EmptyState
            icon={UsersRound}
            title="No customers found"
            description="Try another search, or add the customer without leaving this contract."
          />
        ) : (
          <ChoiceList
            label="Select a customer"
            selectedKey={selected?._id}
            onChoose={(id) => {
              const customer = customers.find((item) => item._id === id);
              if (customer) onSelect(customer);
            }}
            choices={customers.map((item) => ({
              key: item._id,
              title: item.fullName,
              detail: `${formatCnic(item.cnic)} · ${formatMobile(item.phone)}`,
            }))}
          />
        )}
      </QueryView>
    </div>
  );
}
