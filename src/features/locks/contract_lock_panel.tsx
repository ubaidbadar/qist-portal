import { Lock, Unlock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import type { ContractWithSchedule, DeviceCommand, Page } from '@shop/shared';
import { Button, Card } from '../../ui';
import { apiGet } from '../../config/api';
import { useCan } from '../../auth';
import StatusBadge from '../../shared/status_badge';
import { formatDate } from '../../utils/dates';
import PauseModal from './pause_modal';
import { COMMANDS_KEY, LOCK_CENTER_REFRESH_MS } from './queries';
import ReasonModal from './reason_modal';

/** Acknowledgements determine the actual lock state; command history only describes requests in flight. */
export default function ContractLockPanel({ contract }: { contract: ContractWithSchedule }) {
  const can = useCan();
  const history = useQuery({
    queryKey: [COMMANDS_KEY, 'contract', contract._id],
    queryFn: () => apiGet<Page<DeviceCommand>>('/commands', { params: { contractId: contract._id, limit: 5 } }),
    enabled: contract.commands === undefined,
    refetchInterval: contract.commands === undefined ? LOCK_CENTER_REFRESH_MS : false,
  });
  const latest = contract.commands?.[0] ?? history.data?.items[0];
  const waiting = latest && (latest.status === 'proposed' || latest.status === 'pending' || latest.status === 'delivered');
  const manage = can('locks.manage') && contract.status === 'active';
  const locked = contract.deviceLockState === 'locked';
  const knownState = contract.deviceLockState === 'locked' || contract.deviceLockState === 'unlocked';

  return (
    <Card className="space-y-3">
      <h2 className="text-base font-semibold text-ink">Phone lock</h2>
      <p className="text-sm text-body">
        Current state: <span className="font-semibold">{knownState ? (locked ? 'Locked' : 'Unlocked') : 'Unknown'}</span>
      </p>
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
          {knownState && !waiting && !locked && (
            <ReasonModal
              title={`Lock ${contract.customerName}'s phone?`}
              consequence={<>The {contract.deviceLabel} will be locked as soon as it is reachable. Emergency calls keep working.</>}
              confirmText="Lock phone"
              confirmVariant="danger"
              url={`/contracts/${contract._id}/lock`}
              done="Lock queued"
              trigger={(open) => <Button size="sm" variant="danger" icon={Lock} onClick={open}>Lock now</Button>}
            />
          )}
          {knownState && !waiting && locked && (
            <ReasonModal
              title={`Unlock ${contract.customerName}'s phone?`}
              consequence={<>The {contract.deviceLabel} will unlock when it next receives the command.</>}
              confirmText="Unlock phone"
              url={`/contracts/${contract._id}/unlock`}
              done="Unlock queued"
              trigger={(open) => <Button size="sm" variant="outline" icon={Unlock} onClick={open}>Unlock now</Button>}
            />
          )}
          {waiting && latest.type === 'lock' && latest.status === 'pending' && (
            <ReasonModal
              title="Withdraw the lock?"
              consequence="The lock hasn't been delivered to the phone yet."
              confirmText="Withdraw lock"
              url={`/contracts/${contract._id}/unlock`}
              done="Lock withdrawn"
              trigger={(open) => <Button size="sm" variant="outline" icon={Unlock} onClick={open}>Withdraw lock</Button>}
            />
          )}
          {waiting && <span className="self-center text-sm text-muted">{latest.status === 'delivered' ? 'Waiting for phone confirmation' : latest.status === 'proposed' ? 'Lock approval pending' : latest.type !== 'lock' ? 'Command pending' : ''}</span>}
          <PauseModal contractId={contract._id} customerName={contract.customerName} />
        </div>
      )}
    </Card>
  );
}
