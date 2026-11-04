import {
  BarChart3,
  BellRing,
  FileText,
  LayoutDashboard,
  Lock,
  ScrollText,
  Settings,
  Smartphone,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import type { Permission } from '@shop/shared';

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Shown in the mobile bottom bar; the rest live under "More". */
  primary?: boolean;
  group?: 'management';
  /** Hidden from roles without it (docs/plan.md §4). */
  permission?: Permission;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, primary: true },
  { to: '/customers', label: 'Customers', icon: Users, primary: true },
  { to: '/contracts', label: 'Contracts', icon: FileText, primary: true },
  { to: '/payments', label: 'Payments', icon: Wallet, primary: true },
  { to: '/inventory', label: 'Inventory', icon: Smartphone },
  { to: '/lock-center', label: 'Lock Center', icon: Lock },
  { to: '/reminders', label: 'Reminders', icon: BellRing, group: 'management' },
  { to: '/reports', label: 'Reports', icon: BarChart3, group: 'management', permission: 'reports.view' },
  { to: '/settings', label: 'Settings', icon: Settings, group: 'management', permission: 'org.manage' },
  { to: '/audit-log', label: 'Audit log', icon: ScrollText, group: 'management', permission: 'audit.view' },
];
