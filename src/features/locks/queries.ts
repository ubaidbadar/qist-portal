import { queryOptions } from '@tanstack/react-query';
import type { OverdueAccount } from '@shop/shared';
import { apiGet } from '../../config/api';

export const COMMANDS_KEY = 'commands';
export const LOCKS_KEY = 'locks';
/** The Lock Center refreshes on its own: jobs and other branches change it in the background. */
export const LOCK_CENTER_REFRESH_MS = 30_000;

export const overdueQuery = (branchId: string | undefined) =>
  queryOptions({
    queryKey: [LOCKS_KEY, 'overdue', branchId],
    queryFn: () => apiGet<OverdueAccount[]>('/locks/overdue', { params: { branchId } }),
    refetchInterval: LOCK_CENTER_REFRESH_MS,
  });
