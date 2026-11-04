import { queryOptions } from '@tanstack/react-query';
import type { Contract, Page, Payment } from '@shop/shared';
import { apiGet } from '../../config/api';
import { CONTRACTS_KEY } from '../contracts/queries';
import { PAYMENTS_KEY } from '../payments/queries';

export const dashboardPaymentsQuery = (date: string, branchId: string | undefined) =>
  queryOptions({
    queryKey: [PAYMENTS_KEY, 'dashboard', date, branchId],
    queryFn: () => apiGet<Page<Payment>>('/payments', { params: { date, branchId, limit: 5 } }),
  });

export const dashboardContractsQuery = (branchId: string | undefined) =>
  queryOptions({
    queryKey: [CONTRACTS_KEY, 'dashboard', branchId],
    queryFn: () => apiGet<Page<Contract>>('/contracts', { params: { branchId, limit: 5 } }),
  });
