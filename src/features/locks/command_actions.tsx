import { Check, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { DeviceCommand } from '@shop/shared';
import { Button, toast } from '../../ui';
import { apiPost } from '../../config/api';
import { useCan } from '../../auth';
import { CONTRACTS_KEY } from '../contracts/queries';
import { COMMANDS_KEY, LOCKS_KEY } from './queries';
import ReasonModal from './reason_modal';

/** Approve or reject a proposed lock; withdraw a command still waiting for the phone. */
export default function CommandActions({ command }: { command: DeviceCommand }) {
  const can = useCan();
  const queryClient = useQueryClient();
  const approve = useMutation({
    mutationFn: () => apiPost(`/commands/${command._id}/approve`),
    onSuccess: () => {
      toast.success(`Lock for ${command.customerName} approved`);
      return Promise.all([COMMANDS_KEY, LOCKS_KEY, CONTRACTS_KEY].map((key) => queryClient.invalidateQueries({ queryKey: [key] })));
    },
  });
  if (!can('locks.manage') || (command.status !== 'proposed' && command.status !== 'pending')) return null;
  const proposed = command.status === 'proposed';

  return (
    <div className="flex justify-end gap-2">
      {proposed && (
        <Button size="sm" icon={Check} loading={approve.isPending} onClick={() => approve.mutate()}>
          Approve
        </Button>
      )}
      <ReasonModal
        title={proposed ? `Reject the lock for ${command.customerName}?` : `Withdraw this ${command.type}?`}
        consequence={proposed ? 'The phone stays unlocked. The system may propose it again tomorrow if the payment is still late.' : "The command won't be sent to the phone."}
        confirmText={proposed ? 'Reject' : 'Withdraw'}
        confirmVariant="danger"
        url={`/commands/${command._id}/cancel`}
        done={proposed ? 'Lock rejected' : 'Command withdrawn'}
        trigger={(open) => <Button size="sm" variant="ghost" icon={X} onClick={open}>{proposed ? 'Reject' : 'Withdraw'}</Button>}
      />
    </div>
  );
}
