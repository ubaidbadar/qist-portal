import type { ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { lockRequestSchema } from '@shop/shared';
import { Alert, Button, fieldError, Form, Modal, Textarea, toast, type ButtonProps } from '../../ui';
import { apiPost } from '../../config/api';
import { CONTRACTS_KEY } from '../contracts/queries';
import { COMMANDS_KEY, LOCKS_KEY } from './queries';

interface ReasonModalProps {
  title: string;
  /** What will happen, in plain words. */
  consequence: ReactNode;
  confirmText: string;
  confirmVariant?: ButtonProps['variant'];
  /** POSTs `{ reason }` here. */
  url: string;
  done: string;
  trigger: (open: () => void) => ReactNode;
}

/** Every lock decision needs a reason: lock, unlock, reject, withdraw. One dialog for all of them. */
export default function ReasonModal({ title, consequence, confirmText, confirmVariant = 'primary', url, done, trigger }: ReasonModalProps) {
  const queryClient = useQueryClient();

  return (
    <Modal title={title} component={({ open }) => trigger(open)}>
      {(close) => (
        <Form
          schema={lockRequestSchema}
          defaultValues={{ reason: '' }}
          onSubmit={async ({ data }) => {
            await apiPost(url, lockRequestSchema.parse(data));
            await Promise.all([COMMANDS_KEY, LOCKS_KEY, CONTRACTS_KEY].map((key) => queryClient.invalidateQueries({ queryKey: [key] })));
            toast.success(done);
            close();
          }}
          component={({ register, errors, loading, error }) => (
            <div className="space-y-4">
              <div className="text-sm text-body">{consequence}</div>
              <Textarea label="Reason" rows={2} autoFocus {...register('reason')} error={fieldError(errors, 'reason')} />
              {error && <Alert tone="danger">{error}</Alert>}
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={close}>Back</Button>
                <Button type="submit" variant={confirmVariant} loading={loading}>{confirmText}</Button>
              </div>
            </div>
          )}
        />
      )}
    </Modal>
  );
}
