import type { Role } from './constants';

/**
 * What each role may do (docs/plan.md §4). The server enforces it; the portal only uses it to hide actions.
 * Reading data needs no permission: it is limited by organization and assigned branches instead.
 */
export const PERMISSIONS = {
  'org.manage': ['owner'], // organization profile, branches, installment plans, settings, lock policy
  'team.manage': ['owner'], // users, roles, branch access
  'branches.all': ['owner'], // see every branch without being assigned to it
  'customers.write': ['owner', 'manager', 'staff'],
  'customers.delete': ['owner'],
  'stock.write': ['owner', 'manager', 'staff'],
  'stock.transfer': ['owner', 'manager'],
  'stock.costs': ['owner'],
  'stock.delete': ['owner'], // only phones still in stock
  'contracts.create': ['owner', 'manager', 'staff'],
  'contracts.cancel': ['owner', 'manager'],
  'payments.record': ['owner', 'manager', 'staff'],
  'payments.void': ['owner', 'manager'],
  'locks.manage': ['owner', 'manager'],
  'devices.enroll': ['owner', 'manager', 'staff'], // issue or revoke a phone's enrolment QR at the counter
  'reports.view': ['owner', 'manager'],
  'audit.view': ['owner', 'manager'],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export const can = (role: Role, permission: Permission): boolean =>
  (PERMISSIONS[permission] as readonly Role[]).includes(role);
