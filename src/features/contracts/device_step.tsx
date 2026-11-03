import { useState } from 'react';
import { Search } from 'lucide-react';
import type { Device } from '@shop/shared';
import { Input, Select } from '../../ui';
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

/** Step 2: which phone, from the selling branch's stock. */
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
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        {branches.length > 1 && (
          <div className="sm:w-56">
            <Select label="Selling branch" placeholder="Choose a branch" options={branches.map((b) => ({ value: b._id, label: b.name }))} value={branchId} onChange={(event) => onBranchChange(event.target.value)} />
          </div>
        )}
        <div className="flex-1">
          <Input icon={Search} label="Find stock phone" placeholder="IMEI, brand or model" value={q} onChange={(event) => setQ(event.target.value)} />
        </div>
      </div>
      {branchId && can('stock.write') && <DeviceDrawer initialBranchId={branchId} onCreated={onCreated} />}
      {selected && <p className="rounded-control bg-success-50 px-4 py-3 text-sm text-success-800">Selected: <strong>{selected.brand} {selected.model}</strong> · IMEI {selected.imeis[0]}</p>}
      {!branchId ? <p className="rounded-card border border-border bg-surface p-6 text-sm text-muted">Choose the selling branch first.</p> : <QueryView query={{ ...list, data: list.rows }} skeleton={<ListSkeleton rows={3} />}>
        {(devices) =>
          devices.length === 0 ? (
            <div className="rounded-card border border-border bg-surface p-6 text-center">
              <p className="mb-4 text-sm text-muted">No matching phone in stock. Add it here without leaving the sale.</p>
              {can('stock.write') && <DeviceDrawer initialBranchId={branchId} onCreated={onCreated} />}
            </div>
          ) : (
            <ChoiceList
              label="Phones in stock"
              selectedKey={selected?._id}
              onChoose={(id) => {
                const device = devices.find((d) => d._id === id);
                if (device) onSelect(device);
              }}
              choices={devices.map((d) => ({
                key: d._id,
                title: `${d.brand} ${d.model}${d.storage ? ` · ${d.storage}` : ''}`,
                detail: `IMEI ${d.imeis[0]}${d.color ? ` · ${d.color}` : ''}`,
              }))}
            />
          )
        }
      </QueryView>}
    </div>
  );
}
