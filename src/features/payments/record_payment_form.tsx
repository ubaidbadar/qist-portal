import { CUSTOMERS_KEY } from '../customers/queries';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { IDEMPOTENCY_HEADER, PAYMENT_METHODS, textSchema, toPaisa, type ContractWithSchedule, type Payment } from '@shop/shared';
import { Alert, Button, fieldError, Form, Input, Select, toast } from '../../ui';
import { apiPost } from '../../config/api';
import { ALL_BRANCHES, useActiveBranch } from '../../auth';
import MoneyText from '../../shared/money_text';
import { CONTRACTS_KEY } from '../contracts/queries';
import { METHOD_OPTIONS } from './labels';
import { PAYMENTS_KEY } from './queries';

const paymentFormSchema = z.object({
  branchId: z.string().min(1, 'Choose the branch'),
  rupees: z.number({ error: 'Enter the amount' }).positive('Enter the amount'),
  method: z.enum(PAYMENT_METHODS),
  reference: textSchema(60),
});

const nextDue = (contract: ContractWithSchedule) => {
  const next = contract.installments.find((item) => item.paidAmount < item.amount);
  return next ? next.amount - next.paidAmount : 0;
};

export default function RecordPaymentForm({ contract, onDone }: { contract: ContractWithSchedule; onDone: () => void }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { branchId, branches } = useActiveBranch();
  // One key per opening of the form: a double click or a retry after a dropped connection records it once.
  const [requestKey] = useState(() => crypto.randomUUID());
  const outstanding = contract.totalPayable - contract.paidTotal;

  return (
    <Form
      schema={paymentFormSchema}
      defaultValues={{
        branchId: branchId === ALL_BRANCHES ? (branches[0]?._id ?? '') : branchId,
        rupees: nextDue(contract) / 100,
        method: 'cash',
        reference: '',
      }}
      onSubmit={async ({ data }) => {
        const { rupees, ...rest } = paymentFormSchema.parse(data);
        const payment = await apiPost<Payment>(`/contracts/${contract._id}/payments`, { ...rest, amount: toPaisa(rupees) }, { headers: { [IDEMPOTENCY_HEADER]: requestKey } });
        await Promise.all([queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] }), queryClient.invalidateQueries({ queryKey: [CONTRACTS_KEY] }), queryClient.invalidateQueries({ queryKey: [PAYMENTS_KEY] })]);
        toast.success(`Receipt ${payment.receiptNumber} recorded`);
        onDone();
        navigate(`/payments/${payment._id}/receipt`);
      }}
      component={({ register, errors, loading, error }) => (
        <div className="space-y-4">
          <p className="text-sm text-body">
            {contract.customerName} owes <MoneyText amount={outstanding} className="font-semibold text-ink" /> in total. Payments go to the oldest installment first.
          </p>
          {branches.length > 1 && (
            <Select label="Received at" options={branches.map((b) => ({ value: b._id, label: b.name }))} {...register('branchId')} error={fieldError(errors, 'branchId')} />
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Amount (Rs)" type="number" step="0.01" min={0} autoFocus {...register('rupees', { valueAsNumber: true })} error={fieldError(errors, 'rupees') ?? fieldError(errors, 'amount')} />
            <Select label="Method" options={METHOD_OPTIONS} {...register('method')} />
          </div>
          <Input label="Reference (optional)" placeholder="Transaction ID for JazzCash, Easypaisa or bank" {...register('reference')} error={fieldError(errors, 'reference')} />
          {error && <Alert tone="danger">{error}</Alert>}
          <Button type="submit" loading={loading} className="w-full">
            {loading ? 'Recording payment…' : 'Record and print receipt'}
          </Button>
        </div>
      )}
    />
  );
}
