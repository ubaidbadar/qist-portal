import type { HTMLAttributes } from 'react';

export type SkeletonProps = HTMLAttributes<HTMLDivElement>;

/** Placeholder block shown while content loads; size it with `className` (e.g. `h-4 w-32`). */
export default function Skeleton({ className = '', ...props }: SkeletonProps) {
  return <div aria-hidden="true" className={`animate-pulse rounded-small bg-border motion-reduce:animate-none ${className}`} {...props} />;
}
