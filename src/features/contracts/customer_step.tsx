import { useState } from 'react';
import { Search } from 'lucide-react';
import { formatCnic, formatMobile, type Customer } from '@shop/shared';
import { Input } from '../../ui';
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

/** Step 1: who is buying. New customers are added from the Customers page first. */
export default function CustomerStep({ selected, onSelect }: CustomerStepProps) {
  const [q, setQ] = useState(selected?.fullName ?? '');
  const can = useCan();
  const onCreated = (customer: Customer) => {
    onSelect(customer);
    setQ(customer.fullName);
  };
  const search = useDebouncedValue(q.trim());
  const list = usePagedList<Customer>(CUSTOMERS_KEY, '/customers', { q: search || undefined });

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <Input icon={Search} label="Find customer" placeholder="Name, CNIC or mobile" value={q} onChange={(event) => setQ(event.target.value)} autoFocus />
        </div>
        {can('customers.write') && <CustomerDrawer onCreated={onCreated} />}
      </div>
      {selected && <p className="rounded-control bg-success-50 px-4 py-3 text-sm text-success-800">Selected: <strong>{selected.fullName}</strong></p>}
      <QueryView query={{ ...list, data: list.rows }} skeleton={<ListSkeleton rows={3} />}>
        {(customers) =>
          customers.length === 0 ? (
            <div className="rounded-card border border-border bg-surface p-6 text-center">
              <p className="mb-4 text-sm text-muted">No matching customer. Check the search or add them here.</p>
              {can('customers.write') && <CustomerDrawer onCreated={onCreated} />}
            </div>
          ) : (
            <ChoiceList
              label="Customers"
              selectedKey={selected?._id}
              onChoose={(id) => {
                const customer = customers.find((c) => c._id === id);
                if (customer) onSelect(customer);
              }}
              choices={customers.map((c) => ({ key: c._id, title: c.fullName, detail: `${formatCnic(c.cnic)} · ${formatMobile(c.phone)}` }))}
            />
          )
        }
      </QueryView>
    </div>
  );
}
