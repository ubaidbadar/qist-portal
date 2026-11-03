import { useInfiniteQuery } from '@tanstack/react-query';
import type { Page } from '@shop/shared';
import { apiGet } from '../config/api';

/**
 * A list the API returns a page at a time (newest first). `filters` are part of the cache key, so changing a filter
 * starts again from the first page; `loadMore` fetches the next one.
 */
export default function usePagedList<T>(key: string, url: string, filters: Record<string, string | undefined>, { refetchInterval }: { refetchInterval?: number } = {}) {
  const query = useInfiniteQuery({
    queryKey: [key, filters],
    queryFn: ({ pageParam }) => apiGet<Page<T>>(url, { params: { ...filters, cursor: pageParam } }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    refetchInterval,
  });

  return {
    ...query,
    rows: query.data?.pages.flatMap((page) => page.items),
    loadMore: () => void query.fetchNextPage(),
  };
}
