import { queryOptions } from '@tanstack/react-query';
import type { Customer } from '@shop/shared';
import { apiGet } from '../../config/api';

/** Every customer query starts with this key, so one invalidation refreshes lists and profiles alike. */
export const CUSTOMERS_KEY = 'customers';

export const customerQuery = (customerId: string) =>
  queryOptions({ queryKey: [CUSTOMERS_KEY, customerId], queryFn: () => apiGet<Customer>(`/customers/${customerId}`) });
