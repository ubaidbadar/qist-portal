import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

const tones = {
  neutral: 'bg-border text-muted',
  danger: 'bg-danger-100 text-danger-600',
};

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  /** Usually the button that resolves the empty state (e.g. "Add customer"). */
  action?: ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}

export default function EmptyState({ icon: Icon, title, description, action, tone = 'neutral', className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center px-6 py-12 text-center ${className}`}>
      <span className={`mb-4 flex size-12 items-center justify-center rounded-full ${tones[tone]}`}>
        <Icon size={22} aria-hidden="true" />
      </span>
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
