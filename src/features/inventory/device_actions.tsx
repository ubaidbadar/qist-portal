import type { Device } from '@shop/shared';
import { useCan, useMe } from '../../auth';
import DeleteDeviceAction from './delete_device_action';
import DeviceDrawer from './device_drawer';
import EnrollDeviceModal from './enroll_device_modal';
import TransferDeviceModal from './transfer_device_modal';

/** What can be done to a phone: in stock, edit, move or delete (owners); once sold, show its setup QR. */
export default function DeviceActions({ device }: { device: Device }) {
  const can = useCan();
  const { branches } = useMe();
  if (device.stockStatus === 'sold') {
    return can('devices.enroll') ? (
      <div className="flex justify-end gap-1">
        <EnrollDeviceModal device={device} />
      </div>
    ) : null;
  }
  if (device.stockStatus !== 'in_stock') return null;
  const destinations = branches.filter((branch) => branch._id !== device.branchId);

  return (
    <div className="flex justify-end gap-1">
      {can('stock.write') && <DeviceDrawer device={device} />}
      {can('stock.transfer') && destinations.length > 0 && <TransferDeviceModal device={device} destinations={destinations} />}
      {can('stock.delete') && <DeleteDeviceAction device={device} />}
    </div>
  );
}
