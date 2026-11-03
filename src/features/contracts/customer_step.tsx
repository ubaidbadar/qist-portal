import { useState } from 'react';
import { Search } from 'lucide-react';
import { formatCnic, formatMobile, type Customer } from '@shop/shared';
import { Input } from '../../ui';
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
  const search = useDebouncedValue(q.trim());
  const list = usePagedList<Customer>(CUSTOMERS_KEY, '/customers', { q: search || undefined });

  return (
    <div className="space-y-3">
      <Input icon={Search} aria-label="Search customers" placeholder="Search by name, CNIC or mobile" value={q} onChange={(event) => setQ(event.target.value)} autoFocus />
      <QueryView query={{ ...list, data: list.rows }} skeleton={<ListSkeleton rows={3} />}>
        {(customers) =>
          customers.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">No customer matches. Add them on the Customers page first.</p>
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
