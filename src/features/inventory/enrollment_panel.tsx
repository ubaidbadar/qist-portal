import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Device, EnrollmentTicket } from '@shop/shared';
import { Alert, Button } from '../../ui';
import { apiPost } from '../../config/api';
import QrCode from '../../shared/qr_code';
import { formatDateTime, formatTime } from '../../utils/dates';
import { DEVICES_KEY } from './queries';

const SETUP_STEPS = [
  'Factory-reset the phone, or start with a new one, and turn it on.',
  'On the first welcome screen, tap the same spot six times. The QR scanner opens.',
  'Connect to Wi-Fi when asked, then scan this code.',
  'The phone installs the Qist app and finishes setup. Hand it over once the home screen appears.',
];

/**
 * Issues a one-time setup QR on request (issuing again replaces the previous code) and shows it with the steps.
 * The code holds a secret, so it is only shown here, never stored.
 */
export default function EnrollmentPanel({ deviceId, deviceLabel, enrollment }: { deviceId: string; deviceLabel: string; enrollment?: Device['enrollment'] }) {
  const queryClient = useQueryClient();
  const issue = useMutation({
    mutationFn: () => apiPost<EnrollmentTicket>(`/devices/${deviceId}/enrollment`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [DEVICES_KEY] }),
  });
  const ticket = issue.data;

  return (
    <div className="space-y-5">
      {enrollment && (
        <Alert tone="success">
          Enrolled on {formatDateTime(device.enrollment.enrolledAt)}
          {device.enrollment.lastCheckInAt && `; last check-in ${formatDateTime(device.enrollment.lastCheckInAt)}`}.
        </Alert>
      )}

      {!enrollment && (
        <p className="text-sm text-muted">Use this only during a new or factory-reset phone's first setup. An already enrolled phone does not need another QR.</p>
      )}
      {ticket ? (
        <div className="space-y-2 text-center">
          <QrCode value={JSON.stringify(ticket.payload)} label={`Setup QR for ${deviceLabel`} className="mx-auto w-full max-w-xs" />
          <p className="text-sm text-muted">Valid once, until {formatTime(ticket.expiresAt)}.</p>
        </div>
      ) : (
        <p className="text-sm text-body">
          Show a one-time QR code to scan during the phone's first setup. It installs the app that locks the phone if
          payments stop. The code works for one hour.
        </p>
      )}

      <ol className="list-decimal space-y-1.5 pl-5 text-sm text-body">
        {SETUP_STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>

      <Button loading={issue.isPending} onClick={() => issue.mutate()} variant={ticket ? 'ghost' : 'primary'} className="w-full">
        {ticket ? 'Show a new code' : 'Show setup QR'}
      </Button>
    </div>
  );
}
