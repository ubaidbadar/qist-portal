import { Card, Skeleton } from '../ui';

/** Three summary cards with the same padding and typography footprint as their loaded values. */
export default function SummarySkeleton({ className }: { className: string }) {
  return (
    <div className={className} aria-hidden="true">
      {['first', 'second', 'third'].map((key) => (
        <Card key={key} className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-5 w-24 max-w-full" />
            <Skeleton className="mt-1 h-8 w-32 max-w-full" />
            <Skeleton className="mt-1 h-4 w-28 max-w-full" />
          </div>
          <Skeleton className="size-10 shrink-0 rounded-control" />
        </Card>
      ))}
    </div>
  );
}
