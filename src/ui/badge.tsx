import { type HTMLAttributes } from 'react';

const baseClasses = 'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold';

const variants = {
  primary: 'bg-primary text-on-primary',
  secondary: 'bg-accent/10 text-accent border border-accent/20',
  success: 'bg-success-100 text-success-800 border border-success-200',
  warning: 'bg-warning-100 text-warning-800 border border-warning-200',
  error: 'bg-danger-100 text-danger-800 border border-danger-200',
  info: 'bg-info-100 text-info-800 border border-info-200',
  critical: 'bg-danger-800 text-surface border border-danger-800',
  neutral: 'bg-border text-ink',
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: keyof typeof variants;
  pill?: boolean;
}

export default function Badge({
  children,
  variant = 'primary',
  pill = false,
  className = '',
  ...props
}: BadgeProps) {
  const shapeClasses = pill ? 'rounded-pill' : 'rounded-chip';

  return (
    <span
      className={`${baseClasses} ${shapeClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
