import { CUSTOMERS_KEY } from '../customers/queries';
import { Undo2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { paymentVoidSchema, type Payment } from '@shop/shared';
import { Alert, Button, fieldError, Form, IconButton, Modal, Textarea, toast } from '../../ui';
import { apiPost } from '../../config/api';
import MoneyText from '../../shared/money_text';
import { CONTRACTS_KEY } from '../contracts/queries';
import { PAYMENTS_KEY } from './queries';

/** Voiding undoes a payment's effect on the installments; the payment stays on record, marked void. */
export default function VoidPaymentModal({ payment }: { payment: Payment }) {
  const queryClient = useQueryClient();

  return (
    <Modal title={`Void receipt ${payment.receiptNumber}?`} component={({ open }) => <IconButton icon={Undo2} aria-label={`Void receipt ${payment.receiptNumber}`} onClick={open} />}>
      {(close) => (
        <Form
          schema={paymentVoidSchema}
          defaultValues={{ reason: '' }}
          onSubmit={async ({ data }) => {
            await apiPost(`/payments/${payment._id}/void`, paymentVoidSchema.parse(data));
            await Promise.all([queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] }), queryClient.invalidateQueries({ queryKey: [CONTRACTS_KEY] }), queryClient.invalidateQueries({ queryKey: [PAYMENTS_KEY] })]);
            toast.success(`Receipt ${payment.receiptNumber} voided`);
            close();
          }}
          component={({ register, errors, loading, error }) => (
            <div className="space-y-4">
              <p className="text-sm text-body">
                <MoneyText amount={payment.amount} className="font-medium text-ink" /> comes off {payment.customerName}'s installments, which become due again. The
                receipt stays on record, marked void.
              </p>
              <Textarea label="Reason" rows={2} autoFocus {...register('reason')} error={fieldError(errors, 'reason')} />
              {error && <Alert tone="danger">{error}</Alert>}
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={close}>Keep it</Button>
                <Button type="submit" variant="danger" loading={loading}>Void payment</Button>
              </div>
            </div>
          )}
        />
      )}
    </Modal>
  );
}
