import { useSearchParams } from 'react-router-dom';
import { PackageOpen, Search, SearchX } from 'lucide-react';
import { DEVICE_STOCK_STATUSES, type Device } from '@shop/shared';
import { Badge, EmptyState, Input, Select } from '../../ui';
import { ALL_BRANCHES, useActiveBranch, useCan } from '../../auth';
import useDebouncedValue from '../../hooks/useDebouncedValue';
import usePagedList from '../../hooks/usePagedList';
import DataTable, { type Column } from '../../shared/data_table';
import ListSkeleton from '../../shared/list_skeleton';
import MoneyText from '../../shared/money_text';
import Page from '../../shared/page';
import QueryView from '../../shared/query_view';
import StatusBadge from '../../shared/status_badge';
import DeviceActions from './device_actions';
import DeviceDrawer from './device_drawer';
import { DEVICES_KEY } from './queries';

const ALL_STATUSES = 'all';
const STATUS_LABELS = { in_stock: 'In stock', sold: 'Sold', released: 'Released', returned: 'Returned' } as const;
const STATUS_OPTIONS = [
  ...DEVICE_STOCK_STATUSES.map((status) => ({ value: status, label: STATUS_LABELS[status] })),
  { value: ALL_STATUSES, label: 'All phones' },
];

function deviceColumns({ showBranch, showCost }: { showBranch: boolean; showCost: boolean }): Column<Device>[] {
  return [
    {
      header: 'Phone',
      cell: (device) => (
        <span className="font-medium text-ink">
          {device.brand} {device.model}
          <span className="block text-xs font-normal text-muted">{[device.storage, device.color].filter(Boolean).join(' · ')}</span>
        </span>
      ),
    },
    { header: 'IMEI', cell: (device) => <span className="font-mono text-xs leading-5 whitespace-pre">{device.imeis.join('\n')}</span> },
    ...(showBranch ? [{ header: 'Branch', cell: (device: Device) => device.branch?.name ?? '–' }] : []),
    { header: 'PTA', cell: (device) => <Badge variant={device.ptaApproved ? 'success' : 'warning'}>{device.ptaApproved ? 'Approved' : 'Not approved'}</Badge> },
    { header: 'Status', cell: (device) => <StatusBadge status={device.stockStatus} /> },
    ...(showCost ? [{ header: 'Cost', cell: (device: Device) => (device.costPrice == null ? '–' : <MoneyText amount={device.costPrice} />), className: 'text-right' }] : []),
    { header: 'Actions', cell: (device) => <DeviceActions device={device} />, className: 'text-right', hideOnMobile: false },
  ];
}

/** The stock of the branch chosen in the switcher (owners can see all branches at once). Filters live in the URL. */
export default function InventoryPage() {
  const can = useCan();
  const { branchId } = useActiveBranch();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const status = params.get('status') ?? 'in_stock';
  const search = useDebouncedValue(q.trim());
  const allBranches = branchId === ALL_BRANCHES;

  const list = usePagedList<Device>(DEVICES_KEY, '/devices', {
    branchId: allBranches ? undefined : branchId,
    status: status === ALL_STATUSES ? undefined : status,
    q: search || undefined,
  });
  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  return (
    <Page title="Inventory" description="Find phones, check stock status, and manage device enrollment." actions={can('stock.write') && <DeviceDrawer />}>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <Input icon={Search} label="Search stock" placeholder="Search by IMEI, brand or model" value={q} onChange={(event) => setParam('q', event.target.value)} />
          </div>
          <div className="sm:w-48">
            <Select label="Stock status" options={STATUS_OPTIONS} value={status} onChange={(event) => setParam('status', event.target.value)} />
          </div>
        </div>
        <QueryView query={{ ...list, data: list.rows }} skeleton={<ListSkeleton rows={5} />}>
          {(rows) => (
            <DataTable
              rows={rows}
              columns={deviceColumns({ showBranch: allBranches, showCost: can('stock.costs') })}
              rowKey={(device) => device._id}
              hasMore={list.hasNextPage}
              loadingMore={list.isFetchingNextPage}
              onLoadMore={list.loadMore}
              empty={
                search ? (
                  <EmptyState icon={SearchX} title="No matching phones" description={`Nothing matches “${search}” here. Check the IMEI, or the status filter.`} />
                ) : status === 'in_stock' ? (
                  <EmptyState
                    icon={PackageOpen}
                    title="No phones in stock"
                    description="There are no available phones for this branch. Check All phones for sold or released devices, or add a phone to stock."
                    action={can('stock.write') && <DeviceDrawer />}
                  />
                ) : (
                  <EmptyState
                    icon={PackageOpen}
                    title={status === ALL_STATUSES ? 'No phones recorded' : `No ${STATUS_OPTIONS.find((option) => option.value === status)?.label.toLowerCase() ?? 'matching'} phones`}
                    description="Try All phones or another stock status to find the device."
                  />
                )
              }
            />
          )}
        </QueryView>
      </div>
    </Page>
  );
}
