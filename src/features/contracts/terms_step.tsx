import { useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FREQUENCIES, type ContractWithSchedule, type Customer, type Device } from '@shop/shared';
import { Alert, Button, fieldError, Form, Input, Select, toast } from '../../ui';
import { apiPost } from '../../config/api';
import { FREQUENCY_LABELS } from '../../shared/labels';
import { DEVICES_KEY } from '../inventory/queries';
import { CONTRACTS_KEY, plansQuery } from './queries';
import { METHOD_OPTIONS } from '../payments/labels';
import TermsPreview from './terms_preview';
import { defaultTerms, termsFormSchema, toContractTerms } from './terms_form_schema';

interface TermsStepProps {
  branchId: string;
  customer: Customer;
  device: Device;
}

const FREQUENCY_OPTIONS = FREQUENCIES.map((frequency) => ({ value: frequency, label: FREQUENCY_LABELS[frequency] }));

/** Step 3: price and installments, with the schedule recalculated as you type. The server recalculates it again. */
export default function TermsStep({ branchId, customer, device }: TermsStepProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const plans = (useQuery(plansQuery).data ?? []).filter((plan) => plan.active);
  const planOptions = [{ value: '', label: 'Custom terms' }, ...plans.map((plan) => ({ value: plan._id, label: plan.name }))];

  return (
    <Form
      schema={termsFormSchema}
      defaultValues={defaultTerms()}
      onSubmit={async ({ data }) => {
        const terms = toContractTerms(termsFormSchema.parse(data));
        const contract = await apiPost<ContractWithSchedule>('/contracts', { ...terms, branchId, customerId: customer._id, deviceId: device._id });
        await Promise.all([queryClient.invalidateQueries({ queryKey: [CONTRACTS_KEY] }), queryClient.invalidateQueries({ queryKey: [DEVICES_KEY] })]);
        toast.success('Contract created');
        navigate(`/contracts/${contract._id}`, { replace: true });
      }}
      component={({ register, errors, control, setValue, loading, error }) => {
        return (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <Select
                label="Plan"
                options={planOptions}
                {...register('planId', {
                  onChange: (event) => {
                    const plan = plans.find((p) => p._id === event.target.value);
                    if (!plan) return;
                    setValue('count', plan.count);
                    setValue('frequency', plan.frequency);
                    setValue('markupPercent', plan.markupPercent);
                  },
                })}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Cash price (Rs)" type="number" min={0} autoFocus {...register('cashRupees', { valueAsNumber: true })} error={fieldError(errors, 'cashRupees')} />
                <Input label="Down payment (Rs)" type="number" min={0} {...register('downRupees', { valueAsNumber: true })} error={fieldError(errors, 'downRupees')} />
                <Select label="Down payment paid by" options={METHOD_OPTIONS} {...register('downPaymentMethod')} />
                <Input label="Markup %" type="number" step="0.01" min={0} {...register('markupPercent', { valueAsNumber: true })} error={fieldError(errors, 'markupPercent')} />
                <Input label="Installments" type="number" min={1} {...register('count', { valueAsNumber: true })} error={fieldError(errors, 'count')} />
                <Select label="Paid" options={FREQUENCY_OPTIONS} {...register('frequency')} error={fieldError(errors, 'frequency')} />
                <Input label="First installment due" type="date" {...register('firstDueDate')} error={fieldError(errors, 'firstDueDate')} />
              </div>
              {error && <Alert tone="danger">{error}</Alert>}
              <Button type="submit" loading={loading} className="w-full">
                Create contract
              </Button>
            </div>
            <TermsPreview control={control} />
          </div>
        );
      }}
    />
  );
}
