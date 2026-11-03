import { QrCode as QrIcon } from 'lucide-react';
import type { Device } from '@shop/shared';
import { IconButton, Modal } from '../../ui';
import EnrollmentPanel from './enrollment_panel';

/** The setup QR for a sold phone: the clerk scans it during the phone's first setup to install the lock app. */
export default function EnrollDeviceModal({ device }: { device: Device }) {
  const name = `${device.brand} ${device.model}`;
  return (
    <Modal
      title={`Set up ${name}`}
      component={({ open }) => <IconButton icon={QrIcon} aria-label={`Setup QR for ${name}`} onClick={open} />}
    >
      <EnrollmentPanel device={device} />
    </Modal>
  );
}
