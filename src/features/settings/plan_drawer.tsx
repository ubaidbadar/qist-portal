import { Pencil, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { FREQUENCIES, planCreateSchema, type InstallmentPlan } from '@shop/shared';
import { Alert, Button, Drawer, fieldError, Form, IconButton, Input, Select, toast, Toggle } from '../../ui';
import { apiPatch, apiPost } from '../../config/api';
import { MARKUP_BASIS_OPTIONS } from '../contracts/markup_basis';
import { FREQUENCY_LABELS } from '../../shared/labels';
import { plansQuery } from '../contracts/queries';

const FREQUENCY_OPTIONS = FREQUENCIES.map((frequency) => ({ value: frequency, label: FREQUENCY_LABELS[frequency] }));

/** "Add plan", or the edit button of a plan; both open the same form. */
export default function PlanDrawer({ plan }: { plan?: InstallmentPlan }) {
  const queryClient = useQueryClient();

  return (
    <Drawer
      title={plan ? `Edit ${plan.name}` : 'Add installment plan'}
      component={({ open }) =>
        plan ? (
          <IconButton icon={Pencil} aria-label={`Edit ${plan.name}`} onClick={open} />
        ) : (
          <Button icon={Plus} onClick={open}>
            Add plan
          </Button>
        )
      }
    >
      {(close) => (
        <Form
          schema={planCreateSchema}
          defaultValues={{
            name: plan?.name ?? '',
            frequency: plan?.frequency ?? 'monthly',
            count: plan?.count ?? 6,
            markupPercent: plan?.markupPercent ?? 25,
            markupBasis: plan?.markupBasis ?? 'financed',
            minDownPaymentPercent: plan?.minDownPaymentPercent ?? 0,
            active: plan?.active ?? true,
          }}
          onSubmit={async ({ data }) => {
            const input = planCreateSchema.parse(data);
            if (plan) await apiPatch(`/plans/${plan._id}`, input);
            else await apiPost('/plans', input);
            await queryClient.invalidateQueries({ queryKey: plansQuery.queryKey });
            toast.success(plan ? 'Plan updated' : 'Plan added');
            close();
          }}
          component={({ register, errors, loading, error }) => (
            <div className="space-y-4">
              <Input label="Name" placeholder="e.g. 6 months" autoFocus {...register('name')} error={fieldError(errors, 'name')} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Number of installments" type="number" min={1} {...register('count', { valueAsNumber: true })} error={fieldError(errors, 'count')} />
                <Select label="Paid" options={FREQUENCY_OPTIONS} {...register('frequency')} error={fieldError(errors, 'frequency')} />
                <Select label="Calculate markup on" options={MARKUP_BASIS_OPTIONS} {...register('markupBasis')} error={fieldError(errors, 'markupBasis')} />
                <Input label="Markup %" type="number" step="0.01" min={0} {...register('markupPercent', { valueAsNumber: true })} error={fieldError(errors, 'markupPercent')} />
                <Input
                  label="Minimum down payment %"
                  type="number"
                  step="1"
                  min={0}
                  {...register('minDownPaymentPercent', { valueAsNumber: true })}
                  error={fieldError(errors, 'minDownPaymentPercent')}
                />
              </div>
              {plan && <Toggle label="Offered for new sales" {...register('active')} />}
              {error && <Alert tone="danger">{error}</Alert>}
              <Button type="submit" loading={loading} className="w-full">
                {plan ? 'Save changes' : 'Add plan'}
              </Button>
            </div>
          )}
        />
      )}
    </Drawer>
  );
}
