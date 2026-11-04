import { queryOptions } from '@tanstack/react-query';
import type { DashboardSnapshot } from '@shop/shared';
import { apiGet } from '../../config/api';

export const DASHBOARD_KEY = 'dashboard';

/** One request for every dashboard panel; refresh periodically for activity from other users. */
export const dashboardQuery = (date: string, branchId: string | undefined) =>
  queryOptions({
    queryKey: [DASHBOARD_KEY, date, branchId],
    queryFn: () => apiGet<DashboardSnapshot>('/dashboard', { params: { date, branchId } }),
    refetchInterval: 30_000,
  });
