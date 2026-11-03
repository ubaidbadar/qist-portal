import type { ReactNode } from 'react';

const baseClasses =
  'text-xs px-3 py-1.5 rounded-pill transition-colors inline-flex items-center justify-center font-medium';
const activeClasses = 'bg-ink text-surface';
const inactiveClasses = 'bg-surface text-body shadow-card';

export interface PillProps {
  children: ReactNode;
  isActive?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function Pill({
  children,
  isActive = false,
  className = '',
  onClick,
}: PillProps) {
  const stateClasses = isActive ? activeClasses : inactiveClasses;
  const interactiveClasses = onClick ? 'cursor-pointer hover:opacity-90' : '';
  const classes = `${baseClasses} ${stateClasses} ${interactiveClasses} ${className}`;

  if (onClick) {
    return (
      <button
        type="button"
        className={classes}
        onClick={onClick}
        aria-pressed={isActive}
      >
        {children}
      </button>
    );
  }

  return <span className={classes}>{children}</span>;
}
