import { Skeleton } from '../ui';

const PLACEHOLDER_ROWS = ['a', 'b', 'c', 'd', 'e'];

/** Shown while a lazy-loaded page's code arrives. */
export default function PageSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6" aria-busy="true" aria-label="Loading page">
      <Skeleton className="h-8 w-48" />
      <div className="space-y-3">
        {PLACEHOLDER_ROWS.map((row) => (
          <Skeleton key={row} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}
