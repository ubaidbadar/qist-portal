import { Card, Skeleton } from '../ui';

/** Placeholder for a card of list rows. */
export default function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Card padding="none" aria-busy="true" aria-label="Loading">
      <ul className="divide-y divide-border">
        {Array.from({ length: rows }, (_, index) => (
          <li key={index} className="flex items-center gap-3 px-5 py-4">
            <Skeleton className="size-8 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
