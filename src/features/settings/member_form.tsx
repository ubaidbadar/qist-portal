import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import { memberCreateSchema, type Branch, type User, type UserWithTemporaryPassword } from '@shop/shared';
import { Alert, Button, fieldError, Form, Input, Select, toast } from '../../ui';
import { apiPatch, apiPost } from '../../config/api';
import BranchChecklist from './branch_checklist';
import { membersQuery } from './queries';
import TemporaryPasswordNotice from './temporary_password_notice';

// Email is fixed once the account exists: it is how the person signs in.
const editSchema = memberCreateSchema.omit({ email: true });

const ROLE_OPTIONS = [
  { value: 'staff', label: 'Staff: customers, stock, contracts and payments' },
  { value: 'manager', label: 'Manager: also voids, cancellations and phone locks' },
];

interface MemberFormProps {
  member?: User;
  branches: Branch[];
  onDone: () => void;
}

export default function MemberForm({ member, branches, onDone }: MemberFormProps) {
  const queryClient = useQueryClient();
  const [created, setCreated] = useState<UserWithTemporaryPassword | null>(null);

  if (created) return <TemporaryPasswordNotice result={created} onDone={onDone} />;

  return (
    <Form
      schema={member ? editSchema : memberCreateSchema}
      defaultValues={{
        fullName: member?.fullName ?? '',
        email: '',
        role: member?.role ?? 'staff',
        branchIds: member?.branchIds ?? (branches.length === 1 ? [branches[0]._id] : []),
      }}
      onSubmit={async ({ data }) => {
        if (member) {
          await apiPatch(`/users/${member._id}`, editSchema.parse(data));
          toast.success('Saved');
          onDone();
        } else {
          setCreated(await apiPost<UserWithTemporaryPassword>('/users', memberCreateSchema.parse(data)));
        }
        await queryClient.invalidateQueries({ queryKey: membersQuery.queryKey });
      }}
      component={({ register, errors, control, loading, error }) => (
        <div className="space-y-4">
          <Input label="Full name" autoFocus {...register('fullName')} error={fieldError(errors, 'fullName')} />
          {!member && (
            <Input label="Email (used to sign in)" type="email" {...register('email')} error={fieldError(errors, 'email')} />
          )}
          <Select label="Role" options={ROLE_OPTIONS} {...register('role')} error={fieldError(errors, 'role')} />
          <Controller
            control={control}
            name="branchIds"
            render={({ field, fieldState }) => (
              <BranchChecklist branches={branches} value={field.value} onChange={field.onChange} error={fieldState.error?.message} />
            )}
          />
          {error && <Alert tone="danger">{error}</Alert>}
          <Button type="submit" loading={loading} className="w-full">
            {member ? 'Save changes' : 'Add member'}
          </Button>
        </div>
      )}
    />
  );
}
