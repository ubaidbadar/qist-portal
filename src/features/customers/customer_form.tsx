import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { customerCreateSchema, formatCnic, formatMobile, type Customer } from '@shop/shared';
import { Alert, Button, fieldError, Form, Input, Select, Textarea, toast } from '../../ui';
import { apiGet, apiPatch, apiPost } from '../../config/api';
import { ALL_BRANCHES, useActiveBranch } from '../../auth';
import { getErrorDetails } from '../../utils/get_axios_message';
import GuarantorFields from './guarantor_fields';
import { CUSTOMERS_KEY } from './queries';

interface CustomerFormProps {
  customer?: Customer;
  onDone: () => void;
  onCreated?: (customer: Customer) => void;
}

/** Shown as typed by people, not as stored: "35202-1234567-1", "0300 1234567". */
const formValues = (customer: Customer | undefined, homeBranchId: string) => ({
  homeBranchId: customer?.homeBranchId ?? homeBranchId,
  fullName: customer?.fullName ?? '',
  fatherName: customer?.fatherName ?? '',
  cnic: customer ? formatCnic(customer.cnic) : '',
  phone: customer ? formatMobile(customer.phone) : '',
  altPhone: customer ? formatMobile(customer.altPhone) : '',
  address: customer?.address ?? '',
  notes: customer?.notes ?? '',
  guarantors: customer?.guarantors.map((g) => ({ ...g, cnic: formatCnic(g.cnic), phone: formatMobile(g.phone) })) ?? [],
});

export default function CustomerForm({ customer, onDone, onCreated }: CustomerFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { branchId, branches } = useActiveBranch();
  const [duplicateOf, setDuplicateOf] = useState<string | null>(null);
  const defaultBranch = branchId === ALL_BRANCHES ? (branches[0]?._id ?? '') : branchId;

  return (
    <Form
      schema={customerCreateSchema}
      defaultValues={formValues(customer, defaultBranch)}
      onSubmit={async ({ data }) => {
        // The home branch is where they first bought; editing never moves it.
        const { homeBranchId, ...details } = customerCreateSchema.parse(data);
        try {
          const saved = customer
            ? await apiPatch<Customer>(`/customers/${customer._id}`, details)
            : await apiPost<Customer>('/customers', { ...details, homeBranchId });
          await queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] });
          toast.success(customer ? 'Customer updated' : 'Customer added');
          onDone();
          if (!customer) {
            if (onCreated) onCreated(saved);
            else navigate(`/customers/${saved._id}`);
          }
        } catch (err) {
          const existing = getErrorDetails(err)?.customerId;
          setDuplicateOf(typeof existing === 'string' ? existing : null);
          throw err;
        }
      }}
      component={({ register, errors, control, loading, error }) => (
        <div className="space-y-4">
          {!customer && (
            <Select
              label="Home branch"
              options={branches.map((branch) => ({ value: branch._id, label: branch.name }))}
              {...register('homeBranchId')}
              error={fieldError(errors, 'homeBranchId')}
            />
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Full name (as on CNIC)" autoFocus {...register('fullName')} error={fieldError(errors, 'fullName')} />
            <Input label="Father or husband name" {...register('fatherName')} error={fieldError(errors, 'fatherName')} />
            <Input label="CNIC" placeholder="35202-1234567-1" inputMode="numeric" {...register('cnic')} error={fieldError(errors, 'cnic')} />
            <Input label="Mobile" type="tel" placeholder="0300 1234567" {...register('phone')} error={fieldError(errors, 'phone')} />
            <Input label="Second mobile (optional)" type="tel" {...register('altPhone')} error={fieldError(errors, 'altPhone')} />
          </div>
          <Textarea label="Address" rows={2} {...register('address')} error={fieldError(errors, 'address')} />
          <GuarantorFields control={control} register={register} errors={errors} />
          <Textarea label="Notes (optional)" rows={2} {...register('notes')} error={fieldError(errors, 'notes')} />
          {error && (
            <Alert
              tone="danger"
              action={
                duplicateOf && (
                  onCreated ? (
                    <button
                      type="button"
                      className="min-h-12 font-semibold underline"
                      onClick={async () => {
                        try {
                          onCreated(await apiGet<Customer>(`/customers/${duplicateOf}`));
                          onDone();
                        } catch {
                          toast.error('Could not load the existing customer');
                        }
                      }}
                    >
                      Select existing customer
                    </button>
                  ) : (
                    <Link to={`/customers/${duplicateOf}`} onClick={onDone} className="font-medium underline">
                      Open
                    </Link>
                  )
                )
              }
            >
              {error}
            </Alert>
          )}
          <Button type="submit" loading={loading} className="w-full">
            {customer ? 'Save changes' : 'Add customer'}
          </Button>
        </div>
      )}
    />
  );
}
