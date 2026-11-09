import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query';
import type { Customer, CustomerOverview } from '@shop/shared';
import { apiGet } from '../../config/api';

/** Every customer query starts with this key, so one invalidation refreshes lists and profiles alike. */
export const CUSTOMERS_KEY = 'customers';

export const customerQuery = (customerId: string) =>
  queryOptions({ queryKey: [CUSTOMERS_KEY, customerId], queryFn: () => apiGet<Customer>(`/customers/${customerId}`) });


/** Profile and one page of contracts share a request, error state and cache lifetime. */
export const customerOverviewQuery = (customerId: string) => infiniteQueryOptions({
  queryKey: [CUSTOMERS_KEY, customerId, 'overview'],
  queryFn: ({ pageParam }) => apiGet<CustomerOverview>(`/customers/${customerId}/overview`, { params: { cursor: pageParam } }),
  initialPageParam: undefined as string | undefined,
  getNextPageParam: (page) => page.contracts.nextCursor ?? undefined,
});
