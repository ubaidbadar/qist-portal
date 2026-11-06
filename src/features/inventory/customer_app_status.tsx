import type { Device } from '@shop/shared';
import { Alert } from '../../ui';
import { formatDateTime } from '../../utils/dates';

const LABELS = {
  pending: 'Customer app pending',
  downloading: 'Customer app downloading',
  installing: 'Customer app installing',
  installed: 'Customer app installed',
  failed: 'Customer app installation failed',
  needs_attention: 'Customer app needs attention',
  not_configured: 'Customer app download not enabled',
} as const;

const DETAILS = {
  waiting_for_wifi: 'Waiting for Wi-Fi or another unmetered connection.',
  waiting_for_setup: 'Waiting until phone setup has finished.',
  network: 'The download will resume when the connection is available.',
  storage: 'Free some storage on the phone. Installation will retry automatically.',
  invalid_release: 'The app download could not be verified. Contact Qist support.',
  signature_mismatch: 'The installed app has a different signing certificate. Contact Qist support.',
  install_failed: 'Android could not install this release. Contact Qist support.',
  user_action: 'Android requires attention on the phone. Contact Qist support.',
  unsupported_android: 'This app release needs a newer Android version.',
  not_device_owner: 'Device management could not be verified. Contact Qist support.',
} as const;

/** An optional app download never changes the phone's successful enrollment status. */
export default function CustomerAppStatus({ enrollment, compact = false }: { enrollment: NonNullable<Device['enrollment']>; compact?: boolean }) {
  const report = enrollment.customerApp;
  if (compact) return <span className="mt-1 block text-xs text-muted">Device enrolled · {report ? LABELS[report.status] : 'Customer app status not reported'}</span>;
  const tone = report?.status === 'installed' ? 'success' : report?.status === 'failed' || report?.status === 'needs_attention' ? 'warning' : 'info';
  return (
    <Alert tone={tone}>
      <p className="font-semibold">{report ? LABELS[report.status] : 'Customer app status not reported yet'}</p>
      <p className="mt-1">Device enrollment is complete. The customer app is downloaded separately and does not hold up phone setup.</p>
      {report?.detailCode ? <p className="mt-1">{DETAILS[report.detailCode]}</p> : report?.status === 'pending' && <p className="mt-1">Waiting for the background download, normally on Wi-Fi after setup.</p>}
      {report && <p className="mt-1 text-xs">Last reported {formatDateTime(report.reportedAt)}. Updates appear when the phone checks in.</p>}
    </Alert>
  );
}
