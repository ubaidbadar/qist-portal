import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';
import { branchCreateSchema, type Branch } from '@shop/shared';
import { Alert, Button, fieldError, Form, Input, Textarea, toast, Toggle } from '../../ui';
import { apiPatch, apiPost } from '../../config/api';
import { ME_KEY } from '../../auth';
import { branchesQuery } from './queries';

// `active` only matters when editing; the create endpoint ignores it.
const branchFormSchema = branchCreateSchema.extend({ active: z.boolean() });

interface BranchFormProps {
  branch?: Branch;
  onDone: () => void;
}

export default function BranchForm({ branch, onDone }: BranchFormProps) {
  const queryClient = useQueryClient();

  return (
    <Form
      schema={branchFormSchema}
      defaultValues={{
        name: branch?.name ?? '',
        phone: branch?.phone ?? '',
        address: branch?.address ?? '',
        active: branch?.active ?? true,
      }}
      onSubmit={async ({ data }) => {
        const input = branchFormSchema.parse(data);
        if (branch) await apiPatch(`/branches/${branch._id}`, input);
        else await apiPost('/branches', input);
        // The branch switcher reads the signed-in user's branches.
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: branchesQuery.queryKey }),
          queryClient.invalidateQueries({ queryKey: ME_KEY }),
        ]);
        toast.success(branch ? 'Branch updated' : 'Branch added');
        onDone();
      }}
      component={({ register, errors, loading, error }) => (
        <div className="space-y-4">
          <Input label="Name" autoFocus placeholder="e.g. Hall Road" {...register('name')} error={fieldError(errors, 'name')} />
          <Input label="Phone" type="tel" autoComplete="tel" {...register('phone')} error={fieldError(errors, 'phone')} />
          <Textarea label="Address" rows={2} {...register('address')} error={fieldError(errors, 'address')} />
          {branch && <Toggle label="Active" {...register('active')} />}
          {error && <Alert tone="danger">{error}</Alert>}
          <Button type="submit" loading={loading} className="w-full">
            {branch ? 'Save changes' : 'Add branch'}
          </Button>
        </div>
      )}
    />
  );
}
