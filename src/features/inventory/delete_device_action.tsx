import { Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Device } from '@shop/shared';
import { AlertModal, IconButton, toast } from '../../ui';
import api from '../../config/api';
import { DEVICES_KEY } from './queries';

/** Owners only: for a phone entered by mistake that was never sold. */
export default function DeleteDeviceAction({ device }: { device: Device }) {
  const queryClient = useQueryClient();
  const remove = useMutation({
    mutationFn: () => api.delete(`/devices/${device._id}`),
    onSuccess: () => {
      toast.success(`${device.brand} ${device.model} was removed from stock`);
      return queryClient.invalidateQueries({ queryKey: [DEVICES_KEY] });
    },
  });

  return (
    <AlertModal
      title={`Delete ${device.brand} ${device.model}?`}
      description={`IMEI ${device.imeis[0]} is removed from stock. Use this only for a phone entered by mistake; this can't be undone.`}
      onConfirm={() => remove.mutate()}
      component={({ open }) => (
        <IconButton icon={Trash2} aria-label={`Delete ${device.brand} ${device.model}`} onClick={open} loading={remove.isPending} />
      )}
    />
  );
}
