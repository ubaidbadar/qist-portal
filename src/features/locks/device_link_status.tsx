import { useEffect, useState } from 'react';
import type { ContractWithSchedule } from '@shop/shared';
import { formatDateTime } from '../../utils/dates';

type Enrollment = ContractWithSchedule['deviceEnrollment'];

export function deviceContact(enrollment: Enrollment, now: number) {
  if (enrollment === undefined) return { label: 'Status unavailable', lastSeen: null };
  if (enrollment === null) return { label: 'Not linked', lastSeen: null };
  const seen = enrollment.lastCheckInAt;
  // Older servers initialized lastCheckInAt at enrollment, before the first real check-in.
  if (!seen || !Number.isFinite(Date.parse(seen)) || Date.parse(seen) <= Date.parse(enrollment.enrolledAt)) {
    return { label: 'Awaiting first check-in', lastSeen: null };
  }
  return { label: now - Date.parse(seen) <= 30 * 60_000 ? 'Seen recently' : 'No recent check-in', lastSeen: seen };
}

export default function DeviceLinkStatus({ enrollment, loading, now }: { enrollment: Enrollment; loading: boolean; now?: number }) {
  const [clock, setClock] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setClock(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);
  const contact = deviceContact(enrollment, now ?? clock);
  const linked = enrollment !== undefined && enrollment !== null;
  return (
    <div className="grid gap-4 rounded-control border border-border bg-canvas p-4 text-sm sm:grid-cols-3" aria-label="Device connection status">
      <div><p className="text-muted">Device link</p><p className="mt-1 font-semibold text-ink">{loading ? 'Checking…' : linked ? 'Linked' : contact.label === 'Not linked' ? 'Not linked' : 'Status unavailable'}</p></div>
      <div><p className="text-muted">Connection status</p><p className="mt-1 font-semibold text-ink">{loading ? 'Checking…' : contact.label}</p></div>
      <div><p className="text-muted">Last seen</p><p className="mt-1 font-semibold text-ink">{contact.lastSeen ? formatDateTime(contact.lastSeen) : linked ? 'No successful check-in yet' : '—'}</p></div>
      {linked && <p className="text-muted sm:col-span-3">Linked on {formatDateTime(enrollment.enrolledAt)}{enrollment.appVersion ? ` · App ${enrollment.appVersion}` : ''}. Check-ins refresh automatically; recent contact does not guarantee the phone is online now.</p>}
    </div>
  );
}
