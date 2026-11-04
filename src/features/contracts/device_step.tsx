import { useState } from 'react';
import { Search, Smartphone } from 'lucide-react';
import type { Device } from '@shop/shared';
import { EmptyState, Input, Select } from '../../ui';
import { useCan, useMe } from '../../auth';
import DeviceDrawer from '../inventory/device_drawer';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import usePagedList from '../../hooks/usePagedList';
import ListSkeleton from '../../shared/list_skeleton';
import QueryView from '../../shared/query_view';
import { DEVICES_KEY } from '../inventory/queries';
import ChoiceList from './choice_list';

interface DeviceStepProps {
  branchId: string;
  onBranchChange: (branchId: string) => void;
  selected: Device | null;
  onSelect: (device: Device) => void;
}

/** Phone selection is scoped to the selling branch; new stock is added in place. */
export default function DeviceStep({ branchId, onBranchChange, selected, onSelect }: DeviceStepProps) {
  const { branches } = useMe();
  const can = useCan();
  const [q, setQ] = useState('');
  const search = useDebouncedValue(q.trim());
  const list = usePagedList<Device>(DEVICES_KEY, '/devices', { branchId, status: 'in_stock', q: search || undefined }, { enabled: Boolean(branchId) });

  const onCreated = (phone: Device) => {
    onSelect(phone);
    setQ(phone.imeis[0] ?? '');
  };

  return (
    <div className="space-y-4">
      {branches.length > 1 && (
        <div className="max-w-sm">
          <Select
            label="Selling branch"
            placeholder="Choose a branch"
            options={branches.map((branch) => ({ value: branch._id, label: branch.name }))}
            value={branchId}
            onChange={(event) => onBranchChange(event.target.value)}
          />
        </div>
      )}
      {branchId ? (
        <>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <Input
                icon={Search}
                label="Find phone in stock"
                placeholder="Search IMEI, brand or model"
                value={q}
                onChange={(event) => setQ(event.target.value)}
              />
            </div>
            {can('stock.write') && <DeviceDrawer initialBranchId={branchId} onCreated={onCreated} />}
          </div>
          <QueryView query={{ ...list, data: list.rows }} skeleton={<ListSkeleton rows={3} />}>
            {(devices) => devices.length === 0 ? (
              <EmptyState
                icon={Smartphone}
                title="No phones found"
                description="Try another search, or add a phone to this branch without leaving the contract."
              />
            ) : (
              <ChoiceList
                label="Select a phone in stock"
                selectedKey={selected?._id}
                onChoose={(id) => {
                  const device = devices.find((item) => item._id === id);
                  if (device) onSelect(device);
                }}
                choices={devices.map((item) => ({
                  key: item._id,
                  title: `${item.brand} ${item.model}${item.storage ? ` · ${item.storage}` : ''}`,
                  detail: `IMEI ${item.imeis[0]}${item.color ? ` · ${item.color}` : ''}`,
                }))}
              />
            )}
          </QueryView>
        </>
      ) : (
        <EmptyState
          icon={Smartphone}
          title="Choose a selling branch"
          description="The phone must be in stock at the branch making the sale."
        />
      )}
    </div>
  );
}
