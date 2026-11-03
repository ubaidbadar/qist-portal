import { type ReactNode, type ElementType, type ComponentProps } from 'react';
import { useButtonState } from './useButtonState';
import type { LucideIcon } from 'lucide-react';

const baseClasses =
  'cursor-pointer rounded-pill inline-flex min-h-12 items-center justify-center gap-2 font-semibold transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

const variants = {
  primary: 'bg-primary text-on-primary hover:bg-primary/85',
  secondary: 'bg-brand-raised text-on-brand hover:bg-brand-navy',
  outline: 'border border-border bg-surface text-ink hover:bg-canvas',
  ghost: 'bg-transparent text-body hover:bg-border',
  link: 'bg-transparent text-accent underline-offset-4 hover:underline',
  danger: 'bg-danger-100 text-danger-800 hover:bg-danger-200',
  premium: 'bg-brand-raised text-on-brand hover:bg-brand-navy',
};

const sizes = {
  sm: 'px-4 text-xs',
  md: 'px-5 text-sm',
  lg: 'px-7 text-base',
};

/** A link reads as text, so it takes the size's font but no fixed height or padding. */
const linkSizes = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const iconSizes = {
  sm: 14,
  md: 16,
  lg: 18,
};

type ButtonBaseProps<T extends ElementType> = {
  as?: T;
  children?: ReactNode;
  icon?: LucideIcon;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
};

export type ButtonProps<T extends ElementType = 'button'> = ButtonBaseProps<T> &
  Omit<ComponentProps<T>, keyof ButtonBaseProps<T>>;

export default function Button<T extends ElementType = 'button'>({
  as,
  children,
  icon: Icon,
  variant = 'primary',
  size = 'md',
  className = '',
  iconPosition = 'left',
  disabled,
  loading = false,
  ...props
}: ButtonProps<T>) {
  const { isPending, isDisabled } = useButtonState(as, loading, disabled);
  const Component: ElementType = as || 'button';
  const iconSize = iconSizes[size];

  return (
    <Component
      className={`${baseClasses} ${variants[variant]} ${(variant === 'link' ? linkSizes : sizes)[size]} ${className}`}
      disabled={isDisabled}
      aria-busy={isPending ? 'true' : undefined}
      {...props}
    >
      {Icon && iconPosition === 'left' && (
        <Icon size={iconSize} className="shrink-0" aria-hidden="true" />
      )}
      {children}
      {Icon && iconPosition === 'right' && (
        <Icon size={iconSize} className="shrink-0" aria-hidden="true" />
      )}
    </Component>
  );
}
