import { type ElementType, type ComponentProps } from 'react';
import { useButtonState } from './useButtonState';
import type { LucideIcon } from 'lucide-react';

const baseClasses =
  'cursor-pointer inline-flex size-12 items-center justify-center rounded-pill transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shrink-0';

const variants = {
  primary: 'bg-primary text-on-primary hover:bg-primary/85',
  secondary: 'bg-surface text-ink border border-border hover:bg-canvas',
  outline: 'bg-transparent border border-border text-ink hover:bg-border',
  ghost: 'bg-transparent text-muted hover:bg-border hover:text-ink',
  danger: 'bg-danger-50 text-danger-600 hover:bg-danger-100 hover:text-danger-700',
};

const sizes = {
  sm: '',
  md: '',
  lg: '',
};

const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
};

type IconButtonBaseProps<T extends ElementType> = {
  as?: T;
  icon: LucideIcon;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  'aria-label': string;
  className?: string;
  loading?: boolean;
};

export type IconButtonProps<T extends ElementType = 'button'> = IconButtonBaseProps<T> &
  Omit<ComponentProps<T>, keyof IconButtonBaseProps<T>>;

export default function IconButton<T extends ElementType = 'button'>({
  as,
  icon: Icon,
  variant = 'ghost',
  size = 'md',
  className = '',
  disabled,
  loading = false,
  ...props
}: IconButtonProps<T>) {
  const { isPending, isDisabled } = useButtonState(as, loading, disabled);
  const Component: ElementType = as || 'button';
  const iconSize = iconSizes[size];

  return (
    <Component
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isDisabled}
      aria-busy={isPending ? 'true' : undefined}
      {...props}
    >
      <Icon size={iconSize} aria-hidden="true" />
    </Component>
  );
}
