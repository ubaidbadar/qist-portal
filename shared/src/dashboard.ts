import { collectionsQuerySchema, type Collections, type Payment } from './payments';
import type { Contract } from './contracts';
import type { OverdueAccount } from './commands';

/** Same validated branch/date parameters as daily collections. */
export const dashboardQuerySchema = collectionsQuerySchema;

/** One bounded dashboard snapshot: all figures are derived from the signed-in retailer's data. */
export interface DashboardSnapshot {
  date: string;
  collections: Pick<Collections, 'total' | 'count'>;
  overdue: OverdueAccount[];
  payments: Pick<Payment, '_id' | 'customerName' | 'deviceLabel' | 'receiptNumber' | 'amount' | 'voidedAt'>[];
  contracts: Pick<Contract, '_id' | 'customerName' | 'deviceLabel' | 'status' | 'createdAt'>[];
}
