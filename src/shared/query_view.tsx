import type { ReactNode } from 'react';
import { Card, ErrorState } from '../ui';
import getAxiosMessage from '../utils/get_axios_message';

/** What QueryView needs from a TanStack query (plain or infinite). */
interface QueryState<T> {
  data: T | undefined;
  isError: boolean;
  error: unknown;
  refetch: () => unknown;
}

interface QueryViewProps<T> {
  query: QueryState<T>;
  /** Shown while loading; shaped like the content it stands in for. */
  skeleton: ReactNode;
  children: (data: T) => ReactNode;
}

/** The loading, error and success states every data screen needs, in one place. Data already shown stays shown. */
export default function QueryView<T>({ query, skeleton, children }: QueryViewProps<T>) {
  if (query.data !== undefined) return children(query.data);
  if (query.isError) {
    return (
      <Card padding="none">
        <ErrorState message={getAxiosMessage(query.error)} onRetry={() => void query.refetch()} />
      </Card>
    );
  }
  return skeleton;
}
