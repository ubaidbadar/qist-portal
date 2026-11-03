import { Lock, Unlock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { ContractWithSchedule, DeviceCommand, Page } from '@shop/shared';
import { Button, Card } from '../../ui';
import { apiGet } from '../../config/api';
import { useCan } from '../../auth';
import StatusBadge from '../../shared/status_badge';
import { formatDate } from '../../utils/dates';
import PauseModal from './pause_modal';
import { COMMANDS_KEY } from './queries';
import ReasonModal from './reason_modal';

/** The contract's phone: its last lock command, any pause, and the manager's lock, unlock and pause actions. */
export default function ContractLockPanel({ contract }: { contract: ContractWithSchedule }) {
  const can = useCan();
  const history = useQuery({
    queryKey: [COMMANDS_KEY, 'contract', contract._id],
    queryFn: () => apiGet<Page<DeviceCommand>>('/commands', { params: { contractId: contract._id, limit: 5 } }),
    enabled: contract.commands === undefined,
  });
  const latest = contract.commands?.[0] ?? history.data?.items[0];
  const waiting = latest && (latest.status === 'proposed' || latest.status === 'pending');
  const manage = can('locks.manage') && contract.status === 'active';

  return (
    <Card className="space-y-3">
      <h2 className="text-base font-semibold text-ink">Phone lock</h2>
      {latest ? (
        <p className="flex flex-wrap items-center gap-2 text-sm text-body">
          Last: {latest.type} <StatusBadge status={latest.status} /> <span className="text-muted">{formatDate(latest.updatedAt)}</span>
        </p>
      ) : (
        <p className="text-sm text-muted">No lock activity.</p>
      )}
      {contract.autoLockPausedUntil && <p className="text-sm text-muted">Automatic lock paused until {formatDate(contract.autoLockPausedUntil)}: {contract.pauseReason}</p>}
      {manage && (
        <div className="flex flex-wrap gap-2">
          {!waiting && (
            <ReasonModal
              title={`Lock ${contract.customerName}'s phone?`}
              consequence={<>The {contract.deviceLabel} will be locked as soon as it is reachable. It unlocks when the overdue amount is paid; emergency calls keep working.</>}
              confirmText="Lock phone"
              confirmVariant="danger"
              url={`/contracts/${contract._id}/lock`}
              done="Lock queued"
              trigger={(open) => <Button size="sm" variant="danger" icon={Lock} onClick={open}>Lock now</Button>}
            />
          )}
          {waiting && latest.type === 'lock' && (
            <ReasonModal
              title="Withdraw the lock?"
              consequence="The lock won't be sent to the phone."
              confirmText="Withdraw lock"
              url={`/contracts/${contract._id}/unlock`}
              done="Lock withdrawn"
              trigger={(open) => <Button size="sm" variant="outline" icon={Unlock} onClick={open}>Withdraw lock</Button>}
            />
          )}
          <PauseModal contractId={contract._id} customerName={contract.customerName} />
        </div>
      )}
    </Card>
  );
}
