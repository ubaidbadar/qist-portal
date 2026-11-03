import { Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Customer } from '@shop/shared';
import { AlertModal, Button, toast } from '../../ui';
import api from '../../config/api';
import { CUSTOMERS_KEY } from './queries';

/** Owners only: for a customer added by mistake. */
export default function DeleteCustomerAction({ customer }: { customer: Customer }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const remove = useMutation({
    mutationFn: () => api.delete(`/customers/${customer._id}`),
    onSuccess: () => {
      toast.success(`${customer.fullName} was deleted`);
      queryClient.removeQueries({ queryKey: [CUSTOMERS_KEY, customer._id] });
      void queryClient.invalidateQueries({ queryKey: [CUSTOMERS_KEY] });
      navigate('/customers', { replace: true });
    },
  });

  return (
    <AlertModal
      title={`Delete ${customer.fullName}?`}
      description="Their profile and guarantors are removed for every branch. This can't be undone. The audit log keeps a record that you deleted them."
      onConfirm={() => remove.mutate()}
      component={({ open }) => (
        <Button variant="danger" icon={Trash2} onClick={open} loading={remove.isPending}>
          Delete
        </Button>
      )}
    />
  );
}
