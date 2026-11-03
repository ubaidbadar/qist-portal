import { queryOptions } from '@tanstack/react-query';
import type { Page, Payment } from '@shop/shared';
import { apiGet } from '../../config/api';

export const dashboardPaymentsQuery = (date: string, branchId: string | undefined) =>
  queryOptions({
    queryKey: ['dashboard', 'payments', date, branchId],
    queryFn: () => apiGet<Page<Payment>>('/payments', { params: { date, branchId, limit: 5 } }),
  });
