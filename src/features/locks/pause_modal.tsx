import { PauseCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { addDays, pauseLockSchema, todayInShops } from '@shop/shared';
import { Alert, Button, fieldError, Form, Input, Modal, Textarea, toast } from '../../ui';
import { apiPost } from '../../config/api';
import { formatDate } from '../../utils/dates';
import { CONTRACTS_KEY } from '../contracts/queries';
import { COMMANDS_KEY, LOCKS_KEY } from './queries';

const DEFAULT_PAUSE_DAYS = 3;

/** A promise to pay: no automatic lock until the date, and a lock not yet sent is withdrawn. */
export default function PauseModal({ contractId, customerName, triggerClassName = "" }: { contractId: string; customerName: string; triggerClassName?: string }) {
  const queryClient = useQueryClient();

  return (
    <Modal title="Promise to pay" component={({ open }) => <Button variant="outline" icon={PauseCircle} className={triggerClassName} onClick={open}>Pause automatic lock</Button>}>
      {(close) => (
        <Form
          schema={pauseLockSchema}
          defaultValues={{ until: addDays(todayInShops(), DEFAULT_PAUSE_DAYS), reason: '' }}
          onSubmit={async ({ data }) => {
            const input = pauseLockSchema.parse(data);
            await apiPost(`/contracts/${contractId}/pause`, input);
            await Promise.all([COMMANDS_KEY, LOCKS_KEY, CONTRACTS_KEY].map((key) => queryClient.invalidateQueries({ queryKey: [key] })));
            toast.success(`No automatic lock for ${customerName} until ${formatDate(input.until)}`);
            close();
          }}
          component={({ register, errors, loading, error }) => (
            <div className="space-y-4">
              <p className="text-sm text-body">{customerName}'s phone won't be locked automatically until this date. A lock waiting to go out is withdrawn.</p>
              <Input label="Until" type="date" min={todayInShops()} {...register('until')} error={fieldError(errors, 'until')} />
              <Textarea label="What did they promise?" rows={2} placeholder="e.g. Will pay Rs 10,000 on salary day" {...register('reason')} error={fieldError(errors, 'reason')} />
              {error && <Alert tone="danger">{error}</Alert>}
              <Button type="submit" loading={loading} className="w-full">Pause automatic lock</Button>
            </div>
          )}
        />
      )}
    </Modal>
  );
}
