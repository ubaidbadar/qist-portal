import { CUSTOMERS_KEY } from '../customers/queries';
import { Ban } from 'lucide-react';
import type { ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { contractCancelSchema, type Contract } from '@shop/shared';
import { Alert, Button, fieldError, Form, Modal, Textarea, toast } from '../../ui';
import { apiPost } from '../../config/api';
import { DEVICES_KEY } from '../inventory/queries';
import { CONTRACTS_KEY } from './queries';

/** Undoing a sale before any payment: the phone goes back into stock. The reason is kept on the contract. */
export default function CancelContractModal({ contract, trigger }: { contract: Contract; trigger?: (open: () => void) => ReactNode }) {
  const queryClient = useQueryClient();

  return (
    <Modal title="Cancel this contract?" component={({ open }) => trigger ? trigger(open) : <Button variant="danger" icon={Ban} onClick={open}>Cancel contract</Button>}>
      {(close) => (
        <Form
          schema={contractCancelSchema}
          defaultValues={{ reason: '' }}
          onSubmit={async ({ data }) => {
            await apiPost(`/contracts/${contract._id}/cancel`, contractCancelSchema.parse(data));
            await Promise.all([queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] }), queryClient.invalidateQueries({ queryKey: [CONTRACTS_KEY] }), queryClient.invalidateQueries({ queryKey: [DEVICES_KEY] })]);
            toast.success('Contract cancelled; the phone is back in stock');
            close();
          }}
          component={({ register, errors, loading, error }) => (
            <div className="space-y-4">
              <p className="text-sm text-body">
                The sale of {contract.deviceLabel} to {contract.customerName} is undone and the phone returns to stock. This can't be reversed.
              </p>
              <Textarea label="Reason" rows={2} autoFocus {...register('reason')} error={fieldError(errors, 'reason')} />
              {error && <Alert tone="danger">{error}</Alert>}
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={close}>Keep contract</Button>
                <Button type="submit" variant="danger" loading={loading}>Cancel contract</Button>
              </div>
            </div>
          )}
        />
      )}
    </Modal>
  );
}
