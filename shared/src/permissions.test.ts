import { describe, expect, test } from 'bun:test';
import { can, PERMISSIONS, type Permission } from './permissions';
import { ROLES, type Role } from './constants';

// The matrix from docs/plan.md §4, written out so a change to PERMISSIONS has to be a deliberate change here too.
const MATRIX: Record<Permission, Record<Role, boolean>> = {
  'org.manage': { owner: true, manager: false, staff: false },
  'team.manage': { owner: true, manager: false, staff: false },
  'branches.all': { owner: true, manager: false, staff: false },
  'customers.write': { owner: true, manager: true, staff: true },
  'customers.delete': { owner: true, manager: false, staff: false },
  'stock.write': { owner: true, manager: true, staff: true },
  'stock.transfer': { owner: true, manager: true, staff: false },
  'stock.costs': { owner: true, manager: false, staff: false },
  'stock.delete': { owner: true, manager: false, staff: false },
  'contracts.create': { owner: true, manager: true, staff: true },
  'contracts.cancel': { owner: true, manager: true, staff: false },
  'payments.record': { owner: true, manager: true, staff: true },
  'payments.void': { owner: true, manager: true, staff: false },
  'locks.manage': { owner: true, manager: true, staff: false },
  'devices.enroll': { owner: true, manager: true, staff: true },
  'reports.view': { owner: true, manager: true, staff: false },
  'audit.view': { owner: true, manager: true, staff: false },
};

describe('permission matrix', () => {
  test('covers every permission', () => {
    expect(Object.keys(MATRIX).sort()).toEqual(Object.keys(PERMISSIONS).sort());
  });

  for (const permission of Object.keys(MATRIX) as Permission[]) {
    for (const role of ROLES) {
      test(`${role} ${MATRIX[permission][role] ? 'can' : 'cannot'} ${permission}`, () => {
        expect(can(role, permission)).toBe(MATRIX[permission][role]);
      });
    }
  }
});
