import type { Frequency, Role } from '@shop/shared';

export const ROLE_LABELS: Record<Role, string> = { owner: 'Owner', manager: 'Manager', staff: 'Staff' };

/** "Ayesha Khan" → "AK", for avatars. */
export const initialsOf = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('');

export const FREQUENCY_LABELS: Record<Frequency, string> = { weekly: 'Weekly', biweekly: 'Every 2 weeks', monthly: 'Monthly' };

/** "7 × Monthly" */
export const scheduleLabel = (count: number, frequency: Frequency) => `${count} × ${FREQUENCY_LABELS[frequency]}`;
