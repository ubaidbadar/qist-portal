import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import type { Collections, Payment, PaymentsOverview } from '@shop/shared';
import { apiGet } from '../../config/api';
import { CONTRACTS_KEY } from '../contracts/queries';

export const PAYMENTS_KEY = 'payments';

/** Under the contract's key, so anything that refreshes the contract refreshes its ledger too. */
export const ledgerQuery = (contractId: string) =>
  queryOptions({ queryKey: [CONTRACTS_KEY, contractId, 'payments'], queryFn: () => apiGet<Payment[]>(`/contracts/${contractId}/payments`) });

export const paymentQuery = (paymentId: string) =>
  queryOptions({ queryKey: [PAYMENTS_KEY, paymentId], queryFn: () => apiGet<Payment>(`/payments/${paymentId}`) });

export const collectionsQuery = (date: string, branchId: string | undefined) =>
  queryOptions({ queryKey: [PAYMENTS_KEY, 'collections', date, branchId], queryFn: () => apiGet<Collections>('/payments/collections', { params: { date, branchId } }) });


export const paymentsOverviewQuery = (date: string, branchId: string | undefined) => infiniteQueryOptions({
  queryKey: [PAYMENTS_KEY, 'overview', date, branchId],
  queryFn: ({ pageParam }) => apiGet<PaymentsOverview>('/payments/overview', { params: { date, branchId, cursor: pageParam } }),
  initialPageParam: undefined as string | undefined,
  getNextPageParam: (page) => page.nextCursor ?? undefined,
});
