import { Lock, Unlock, ShieldCheck, ShieldAlert } from 'lucide-react';
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
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">Phone controls</h2>
          <p className="mt-1 text-sm text-muted">Remote lock status and available actions.</p>
        </div>
        <span className={`inline-flex items-center gap-2 rounded-pill px-3 py-2 text-sm font-semibold ${
          locked ? 'bg-danger-100 text-danger-800' : knownState ? 'bg-success-100 text-success-800' : 'bg-border text-muted'
        }`}>
          {locked ? <ShieldAlert size={17} aria-hidden="true" /> : <ShieldCheck size={17} aria-hidden="true" />}
          {knownState ? (locked ? 'Locked' : 'Unlocked') : 'State unknown'}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm text-body">
        {latest ? (
          <>
            <span>Last request: <span className="font-semibold capitalize">{latest.type}</span></span>
            <StatusBadge status={latest.status} />
            <span className="text-muted">{formatDate(latest.updatedAt)}</span>
          </>
        ) : <span className="text-muted">No lock activity yet.</span>}
      </div>
      {waiting && <p role="status" className="rounded-control bg-info-50 px-4 py-3 text-sm text-info-800">
        {latest.status === 'delivered'
          ? 'The command was delivered. Waiting for the phone to confirm it.'
          : latest.status === 'proposed'
            ? 'Lock request is awaiting approval.'
            : latest.type === 'lock'
              ? 'The lock command is queued and has not reached the phone yet.'
              : 'The command is queued and waiting for the phone.'}
      </p>}
      {contract.autoLockPausedUntil && (
        <p className="rounded-control bg-warning-50 px-4 py-3 text-sm text-warning-800">
          Automatic lock paused until {formatDate(contract.autoLockPausedUntil)}{contract.pauseReason ? `: ${contract.pauseReason}` : ''}
        </p>
      )}
      {manage && (
        <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          {knownState && !waiting && !locked && (
            <ReasonModal
              title={`Lock ${contract.customerName}'s phone?`}
              consequence={<>The {contract.deviceLabel} will be locked as soon as it is reachable. Emergency calls keep working.</>}
              confirmText="Lock phone"
              confirmVariant="danger"
              url={`/contracts/${contract._id}/lock`}
              done="Lock queued"
              trigger={(open) => <Button variant="danger" icon={Lock} className="w-full sm:w-auto" onClick={open}>Lock phone</Button>}
            />
          )}
          {knownState && !waiting && locked && (
            <ReasonModal
              title={`Unlock ${contract.customerName}'s phone?`}
              consequence={<>The {contract.deviceLabel} will unlock when it next receives the command.</>}
              confirmText="Unlock phone"
              url={`/contracts/${contract._id}/unlock`}
              done="Unlock queued"
              trigger={(open) => <Button variant="outline" icon={Unlock} className="w-full sm:w-auto" onClick={open}>Unlock phone</Button>}
            />
          )}
          {waiting && latest.type === 'lock' && latest.status === 'pending' && (
            <ReasonModal
              title="Withdraw the lock?"
              consequence="The lock hasn't been delivered to the phone yet."
              confirmText="Withdraw lock"
              url={`/contracts/${contract._id}/unlock`}
              done="Lock withdrawn"
              trigger={(open) => <Button variant="outline" icon={Unlock} className="w-full sm:w-auto" onClick={open}>Withdraw lock</Button>}
            />
          )}
          <PauseModal contractId={contract._id} customerName={contract.customerName} triggerClassName="w-full sm:w-auto" />
        </div>
      )}
    </Card>
  );
}
