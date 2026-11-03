import {
  AlertTriangle,
  Ban,
  CalendarClock,
  CheckCheck,
  CheckCircle2,
  CircleDashed,
  CircleDot,
  Clock,
  Hourglass,
  Lock,
  Package,
  RotateCcw,
  Send,
  ShoppingBag,
  Unlock,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { Badge, type BadgeProps } from '../ui';

interface StatusStyle {
  label: string;
  variant: BadgeProps['variant'];
  icon: LucideIcon;
}

// One meaning, one look, everywhere: green = settled, gray = waiting, amber = due soon, red = overdue, dark red = locked.
const STATUSES = {
  paid: { label: 'Paid', variant: 'success', icon: CheckCircle2 },
  completed: { label: 'Completed', variant: 'success', icon: CheckCircle2 },
  partial: { label: 'Part paid', variant: 'warning', icon: CircleDashed },
  cancelled: { label: 'Cancelled', variant: 'neutral', icon: Ban },
  defaulted: { label: 'Defaulted', variant: 'error', icon: AlertTriangle },
  released: { label: 'Released', variant: 'success', icon: Unlock },
  sold: { label: 'Sold', variant: 'info', icon: ShoppingBag },
  returned: { label: 'Returned', variant: 'warning', icon: RotateCcw },
  acknowledged: { label: 'Acknowledged', variant: 'success', icon: CheckCheck },
  pending: { label: 'Pending', variant: 'neutral', icon: Clock },
  proposed: { label: 'To approve', variant: 'warning', icon: Hourglass },
  failed: { label: 'Failed', variant: 'error', icon: XCircle },
  unlocked: { label: 'Unlocked', variant: 'success', icon: Unlock },
  in_stock: { label: 'In stock', variant: 'neutral', icon: Package },
  active: { label: 'Active', variant: 'info', icon: CircleDot },
  delivered: { label: 'Delivered', variant: 'info', icon: Send },
  due_soon: { label: 'Due soon', variant: 'warning', icon: CalendarClock },
  overdue: { label: 'Overdue', variant: 'error', icon: AlertTriangle },
  locked: { label: 'Locked', variant: 'critical', icon: Lock },
} satisfies Record<string, StatusStyle>;

export type Status = keyof typeof STATUSES;

export default function StatusBadge({ status }: { status: Status }) {
  const { label, variant, icon: Icon } = STATUSES[status];

  return (
    <Badge variant={variant} pill>
      <Icon size={12} aria-hidden="true" />
      {label}
    </Badge>
  );
}
