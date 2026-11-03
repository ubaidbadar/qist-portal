import type { ReactNode } from 'react';

interface TagProps {
  children: ReactNode;
  className?: string;
}

export default function Tag({ children, className = '' }: TagProps) {
  return (
    <span className={`bg-border text-muted text-xs px-3 py-1.5 rounded-control ${className}`}>
      {children}
    </span>
  );
}
