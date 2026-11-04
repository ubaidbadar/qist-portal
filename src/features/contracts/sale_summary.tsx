import { Store, Smartphone, UserRound } from 'lucide-react';
import type { Customer, Device } from '@shop/shared';
import { Card } from '../../ui';

interface SaleSummaryProps {
  customer: Customer | null;
  device: Device | null;
  branchName: string | null;
}

/** Helpful context on desktop without duplicating selection controls. */
export default function SaleSummary({ customer, device, branchName }: SaleSummaryProps) {
  return (
    <Card className="hidden lg:block">
      <h2 className="text-base font-semibold text-ink">Sale summary</h2>
      <p className="mt-1 text-sm text-muted">Your selections so far.</p>
      <ul className="mt-4 divide-y divide-border">
        <li className="flex items-start gap-3 py-3">
          <UserRound size={19} className="mt-0.5 shrink-0 text-muted" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs text-muted">Customer</p>
            <p className="mt-0.5 break-words text-sm font-semibold text-ink">{customer?.fullName ?? 'Not selected'}</p>
          </div>
        </li>
        <li className="flex items-start gap-3 py-3">
          <Smartphone size={19} className="mt-0.5 shrink-0 text-muted" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs text-muted">Phone</p>
            <p className="mt-0.5 break-words text-sm font-semibold text-ink">
              {device ? `${device.brand} ${device.model}` : 'Not selected'}
            </p>
          </div>
        </li>
        <li className="flex items-start gap-3 py-3">
          <Store size={19} className="mt-0.5 shrink-0 text-muted" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-xs text-muted">Selling branch</p>
            <p className="mt-0.5 break-words text-sm font-semibold text-ink">{branchName ?? 'Not selected'}</p>
          </div>
        </li>
      </ul>
    </Card>
  );
}
