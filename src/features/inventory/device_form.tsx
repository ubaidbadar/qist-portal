import { useQueryClient } from '@tanstack/react-query';
import type { Device } from '@shop/shared';
import { Alert, Button, fieldError, Form, Input, Select, toast, Toggle } from '../../ui';
import { apiPatch, apiPost } from '../../config/api';
import { ALL_BRANCHES, useActiveBranch, useCan } from '../../auth';
import { deviceFormSchema, deviceFormValues, toDeviceInput } from './device_form_schema';
import { DEVICES_KEY } from './queries';

/** Common brands in Pakistani shops, offered as suggestions; any brand can be typed. */
const BRANDS = ['Samsung', 'Infinix', 'Tecno', 'Xiaomi', 'Redmi', 'Vivo', 'Oppo', 'Realme', 'Apple', 'Honor', 'Nokia', 'itel', 'Motorola', 'OnePlus'];

interface DeviceFormProps {
  device?: Device;
  onDone: () => void;
}

export default function DeviceForm({ device, onDone }: DeviceFormProps) {
  const queryClient = useQueryClient();
  const can = useCan();
  const { branchId, branches } = useActiveBranch();
  const defaultBranch = branchId === ALL_BRANCHES ? (branches[0]?._id ?? '') : branchId;

  return (
    <Form
      schema={deviceFormSchema}
      defaultValues={deviceFormValues(device, defaultBranch)}
      onSubmit={async ({ data }) => {
        // The branch changes only through a transfer, so an edit leaves it out.
        const { branchId: newBranchId, ...details } = toDeviceInput(deviceFormSchema.parse(data));
        if (device) await apiPatch(`/devices/${device._id}`, details);
        else await apiPost('/devices', { ...details, branchId: newBranchId });
        await queryClient.invalidateQueries({ queryKey: [DEVICES_KEY] });
        toast.success(device ? 'Phone updated' : 'Phone added to stock');
        onDone();
      }}
      component={({ register, errors, loading, error }) => (
        <div className="space-y-4">
          {!device && (
            <Select
              label="Branch"
              options={branches.map((branch) => ({ value: branch._id, label: branch.name }))}
              {...register('branchId')}
              error={fieldError(errors, 'branchId')}
            />
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Brand" list="device-brands" autoFocus {...register('brand')} error={fieldError(errors, 'brand')} />
            <datalist id="device-brands">
              {BRANDS.map((brand) => (
                <option key={brand} value={brand} />
              ))}
            </datalist>
            <Input label="Model" placeholder="e.g. Galaxy A15" {...register('model')} error={fieldError(errors, 'model')} />
            <Input label="Storage (optional)" placeholder="e.g. 128 GB" {...register('storage')} error={fieldError(errors, 'storage')} />
            <Input label="Colour (optional)" {...register('color')} error={fieldError(errors, 'color')} />
            <Input label="IMEI 1" inputMode="numeric" placeholder="Dial *#06# on the phone" {...register('imei1')} error={fieldError(errors, 'imei1')} />
            <Input label="IMEI 2 (dual SIM, optional)" inputMode="numeric" {...register('imei2')} error={fieldError(errors, 'imei2')} />
            {can('stock.costs') && (
              <Input label="Cost price in Rs (optional)" inputMode="decimal" {...register('costRupees')} error={fieldError(errors, 'costRupees')} />
            )}
          </div>
          <Toggle label="PTA approved" {...register('ptaApproved')} />
          {error && <Alert tone="danger">{error}</Alert>}
          <Button type="submit" loading={loading} className="w-full">
            {device ? 'Save changes' : 'Add to stock'}
          </Button>
        </div>
      )}
    />
  );
}
