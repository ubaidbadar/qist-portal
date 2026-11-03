import { Pencil, Plus } from 'lucide-react';
import type { Device } from '@shop/shared';
import { Button, Drawer, IconButton } from '../../ui';
import DeviceForm from './device_form';

/** "Add phone", or the edit button of a phone in stock; both open the same form. */
export default function DeviceDrawer({ device, initialBranchId, onCreated }: { device?: Device; initialBranchId?: string; onCreated?: (device: Device) => void }) {
  return (
    <Drawer
      title={device ? `Edit ${device.brand} ${device.model}` : 'Add phone to stock'}
      component={({ open }) =>
        device ? (
          <IconButton icon={Pencil} aria-label={`Edit ${device.brand} ${device.model}`} onClick={open} />
        ) : (
          <Button icon={Plus} onClick={open}>
            Add phone
          </Button>
        )
      }
    >
      {(close) => <DeviceForm device={device} initialBranchId={initialBranchId} onCreated={onCreated} onDone={close} />}
    </Drawer>
  );
}
