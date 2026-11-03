import { ArrowRightLeft } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { deviceTransferSchema, type Branch, type Device } from '@shop/shared';
import { Alert, Button, fieldError, Form, IconButton, Modal, Select, toast } from '../../ui';
import { apiPost } from '../../config/api';
import { DEVICES_KEY } from './queries';

interface TransferDeviceModalProps {
  device: Device;
  /** Branches the user works at, other than the phone's current one. */
  destinations: Branch[];
}

/** Moves a phone in stock to another branch; the audit log keeps the history. */
export default function TransferDeviceModal({ device, destinations }: TransferDeviceModalProps) {
  const queryClient = useQueryClient();

  return (
    <Modal
      title={`Move ${device.brand} ${device.model}`}
      component={({ open }) => (
        <IconButton icon={ArrowRightLeft} aria-label={`Move ${device.brand} ${device.model} to another branch`} onClick={open} />
      )}
    >
      {(close) => (
        <Form
          schema={deviceTransferSchema}
          defaultValues={{ toBranchId: destinations[0]?._id ?? '' }}
          onSubmit={async ({ data }) => {
            const { toBranchId } = deviceTransferSchema.parse(data);
            await apiPost(`/devices/${device._id}/transfer`, { toBranchId });
            await queryClient.invalidateQueries({ queryKey: [DEVICES_KEY] });
            toast.success(`Moved to ${destinations.find((branch) => branch._id === toBranchId)?.name}`);
            close();
          }}
          component={({ register, errors, loading, error }) => (
            <div className="space-y-4">
              <p className="text-sm text-body">
                From <strong className="font-medium text-ink">{device.branch?.name}</strong> to:
              </p>
              <Select
                label="Branch"
                options={destinations.map((branch) => ({ value: branch._id, label: branch.name }))}
                {...register('toBranchId')}
                error={fieldError(errors, 'toBranchId')}
              />
              {error && <Alert tone="danger">{error}</Alert>}
              <Button type="submit" loading={loading} className="w-full">
                Move phone
              </Button>
            </div>
          )}
        />
      )}
    </Modal>
  );
}
