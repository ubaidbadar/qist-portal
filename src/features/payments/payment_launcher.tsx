import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Banknote, Search } from 'lucide-react';
import { formatCnic, type Contract, type ContractWithSchedule, type Customer } from '@shop/shared';
import { Button, Input, Modal } from '../../ui';
import { useCan } from '../../auth';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import usePagedList from '../../hooks/usePagedList';
import ListSkeleton from '../../shared/list_skeleton';
import QueryView from '../../shared/query_view';
import { CUSTOMERS_KEY } from '../customers/queries';
import { CONTRACTS_KEY, contractQuery } from '../contracts/queries';
import RecordPaymentForm from './record_payment_form';

interface Selection {
  search: string;
  customer: Customer | null;
  contract: Contract | null;
}

/** Select a customer and outstanding contract, then record payment in the same modal. */
function PaymentChooser({ onDone }: { onDone: () => void }) {
  const [selection, setSelection] = useState<Selection>({ search: '', customer: null, contract: null });
  const q = useDebouncedValue(selection.search.trim());
  const customers = usePagedList<Customer>(CUSTOMERS_KEY, '/customers', { q: q || undefined }, { enabled: !selection.customer });
  const contracts = usePagedList<Contract>(CONTRACTS_KEY, '/contracts', { customerId: selection.customer?._id }, { enabled: Boolean(selection.customer) && !selection.contract });
  const details = useQuery({ ...contractQuery(selection.contract?._id ?? ''), enabled: Boolean(selection.contract) });

  if (selection.contract) {
    return (
      <div className="space-y-4">
        <Button size="sm" variant="ghost" onClick={() => setSelection((previous) => ({ ...previous, contract: null }))}>Change contract</Button>
        <QueryView query={details} skeleton={<ListSkeleton rows={2} />}>
          {(contract: ContractWithSchedule) => <RecordPaymentForm contract={contract} onDone={onDone} />}
        </QueryView>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selection.customer ? (
        <div className="flex items-center justify-between gap-3 rounded-card bg-canvas p-3">
          <div className="min-w-0"><p className="font-semibold text-ink">{selection.customer.fullName}</p><p className="text-sm text-muted">{formatCnic(selection.customer.cnic)}</p></div>
          <Button size="sm" variant="outline" onClick={() => setSelection((previous) => ({ ...previous, customer: null, contract: null }))}>Change</Button>
        </div>
      ) : (
        <Input icon={Search} label="Find customer" placeholder="Name, CNIC or mobile" value={selection.search} onChange={(event) => setSelection((previous) => ({ ...previous, search: event.target.value }))} autoFocus />
      )}

      {!selection.customer ? (
        <QueryView query={{ ...customers, data: customers.rows }} skeleton={<ListSkeleton rows={3} />}>
          {(items) => items.length ? (
            <ul className="max-h-72 divide-y divide-border overflow-y-auto rounded-card border border-border">
              {items.map((customer) => (
                <li key={customer._id}>
                  <button type="button" className="flex min-h-14 w-full flex-col justify-center px-4 py-2 text-start hover:bg-canvas" onClick={() => setSelection((previous) => ({ ...previous, customer }))}>
                    <span className="font-semibold text-ink">{customer.fullName}</span>
                    <span className="text-xs text-muted">{formatCnic(customer.cnic)}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : <p className="text-sm text-muted">No matching customers.</p>}
        </QueryView>
      ) : (
        <>
          <p className="font-semibold text-ink">Choose the contract to pay</p>
          <QueryView query={{ ...contracts, data: contracts.rows }} skeleton={<ListSkeleton rows={3} />}>
            {(items) => {
              const eligible = items.filter((contract) => contract.status === 'active' && contract.paidTotal < contract.totalPayable);
              return eligible.length ? (
                <ul className="max-h-72 divide-y divide-border overflow-y-auto rounded-card border border-border">
                  {eligible.map((contract) => (
                    <li key={contract._id}>
                      <button type="button" className="flex min-h-14 w-full items-center justify-between gap-3 px-4 py-2 text-start hover:bg-canvas" onClick={() => setSelection((previous) => ({ ...previous, contract }))}>
                        <span className="font-semibold text-ink">{contract.deviceLabel}</span>
                        <span className="text-sm text-muted">Select</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-sm text-muted">No active unpaid contracts for this customer.</p>;
            }}
          </QueryView>
        </>
      )}
    </div>
  );
}

export default function PaymentLauncher() {
  const can = useCan();
  if (!can('payments.record')) return null;
  return (
    <Modal title="Record payment" component={({ open }) => <Button icon={Banknote} onClick={open}>Record payment</Button>}>
      {(close) => <PaymentChooser onDone={close} />}
    </Modal>
  );
}
