import { queryOptions } from '@tanstack/react-query';
import type { ContractWithSchedule, InstallmentPlan } from '@shop/shared';
import { apiGet } from '../../config/api';

/** Every contract query starts with this key, so one invalidation refreshes lists and contract pages. */
export const CONTRACTS_KEY = 'contracts';

export const contractQuery = (contractId: string) =>
  queryOptions({ queryKey: [CONTRACTS_KEY, contractId], queryFn: () => apiGet<ContractWithSchedule>(`/contracts/${contractId}`) });

export const plansQuery = queryOptions({ queryKey: ['plans'], queryFn: () => apiGet<InstallmentPlan[]>('/plans') });
