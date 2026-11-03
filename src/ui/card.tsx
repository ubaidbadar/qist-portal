import type { ReactNode, HTMLAttributes } from 'react';

const paddings = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-5 sm:p-8',
  xl: 'p-5 sm:p-10',
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  padding?: keyof typeof paddings;
  interactive?: boolean;
}

export default function Card({
  children,
  className = '',
  padding = 'md',
  interactive = false,
  ...props
}: CardProps) {
  const interactiveClasses = interactive
    ? 'hover:shadow-lg hover:-translate-y-1 transition duration-300 cursor-pointer'
    : '';

  return (
    <div
      className={`bg-surface rounded-card shadow-card ${paddings[padding]} ${interactiveClasses} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
