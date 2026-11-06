import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useFieldArray, useWatch, type Control, type FieldErrors, type FieldValues, type UseFormRegister } from 'react-hook-form';
import { paymentSettingsSchema, type Org } from '@shop/shared';
import { Alert, Button, Card, fieldError, Form, Input, Select, Skeleton, toast, Toggle } from '../../ui';
import { apiPatch } from '../../config/api';
import { ME_KEY } from '../../auth';
import QueryView from '../../shared/query_view';
import { orgQuery } from './queries';

const METHOD_OPTIONS = [
  { value: 'cash', label: 'Cash at shop' },
  { value: 'easypaisa', label: 'Easypaisa' },
  { value: 'jazzcash', label: 'JazzCash' },
  { value: 'bank', label: 'Bank transfer' },
];

export default function PaymentMethodsTab() {
  const query = useQuery(orgQuery);
  const queryClient = useQueryClient();
  return (
    <QueryView query={query} skeleton={<Skeleton className="h-48 w-full max-w-2xl" />}>
      {(org) => (
        <Card className="max-w-2xl space-y-4">
          <div>
            <h2 className="text-base font-semibold text-ink">How customers can pay</h2>
            <p className="mt-1 text-sm text-muted">Enabled methods appear in the customer app. Cash uses the selling branch’s address. Qist does not process payments.</p>
          </div>
          <Form
            key={org.updatedAt}
            schema={paymentSettingsSchema}
            defaultValues={{ paymentMethods: org.paymentMethods ?? [] }}
            onSubmit={async ({ data, onSuccess }) => {
              const saved = await apiPatch<Org>('/org/payment-methods', paymentSettingsSchema.parse(data));
              toast.success('Payment methods saved');
              queryClient.setQueryData(orgQuery.queryKey, saved);
              await queryClient.invalidateQueries({ queryKey: ME_KEY });
              onSuccess('Payment methods saved');
            }}
            component={({ control, register, errors, loading, error, message }) => (
              <div className="space-y-4">
                <PaymentMethodFields control={control} register={register} errors={errors} disabled={loading} />
                {fieldError(errors, 'paymentMethods') && <Alert tone="danger">{fieldError(errors, 'paymentMethods')}</Alert>}
                {error && <Alert tone="danger">{error}</Alert>}
                {message && <Alert tone="success">{message}</Alert>}
                <Button type="submit" loading={loading}>Save payment methods</Button>
              </div>
            )}
          />
        </Card>
      )}
    </QueryView>
  );
}

interface FieldsProps {
  control: Control<FieldValues>;
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  disabled?: boolean;
}

function PaymentMethodFields({ control, register, errors, disabled }: FieldsProps) {
  const { fields, append, remove } = useFieldArray({ control, name: 'paymentMethods', keyName: 'formKey' });
  return (
    <div className="space-y-4">
      {fields.length === 0 && <p className="text-sm text-muted">No payment instructions added. Customers will be asked to contact their retailer.</p>}
      {fields.map((field, index) => (
        <fieldset key={field.formKey} disabled={disabled} className="space-y-3 rounded-card border border-border p-4">
          <legend className="px-1 text-sm font-semibold text-ink">Payment method {index + 1}</legend>
          <input type="hidden" {...register(`paymentMethods.${index}.id`)} />
          <MethodFields index={index} control={control} register={register} errors={errors} />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Toggle label="Show to customers" {...register(`paymentMethods.${index}.enabled`)} />
            <Button type="button" variant="ghost" onClick={() => remove(index)}>Remove</Button>
          </div>
        </fieldset>
      ))}
      <Button type="button" variant="secondary" disabled={disabled || fields.length >= 10} onClick={() => append({ id: crypto.randomUUID(), kind: 'cash', enabled: true, accountTitle: '', accountNumber: '', bankName: '' })}>Add payment method</Button>
    </div>
  );
}

function MethodFields({ index, control, register, errors }: FieldsProps & { index: number }) {
  const prefix = `paymentMethods.${index}`;
  const kind = useWatch({ control, name: `${prefix}.kind` });
  return (
    <>
      <Select label="Method" options={METHOD_OPTIONS} {...register(`${prefix}.kind`)} error={fieldError(errors, `${prefix}.kind`)} />
      {kind !== 'cash' && (
        <>
          <Input label="Account title" {...register(`${prefix}.accountTitle`)} error={fieldError(errors, `${prefix}.accountTitle`)} />
          {kind === 'bank' && <Input label="Bank name" {...register(`${prefix}.bankName`)} error={fieldError(errors, `${prefix}.bankName`)} />}
          <Input label={kind === 'bank' ? 'IBAN' : 'Account mobile number'} {...register(`${prefix}.accountNumber`)} error={fieldError(errors, `${prefix}.accountNumber`)} />
        </>
      )}
    </>
  );
}
