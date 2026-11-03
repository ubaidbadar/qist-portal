import type { HTMLAttributes, ReactNode } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, type LucideIcon } from 'lucide-react';

const tones: Record<string, { classes: string; icon: LucideIcon }> = {
  info: { classes: 'border-info-200 bg-info-50 text-info-800', icon: Info },
  success: { classes: 'border-success-200 bg-success-50 text-success-800', icon: CheckCircle2 },
  warning: { classes: 'border-warning-200 bg-warning-50 text-warning-800', icon: AlertTriangle },
  danger: { classes: 'border-danger-200 bg-danger-50 text-danger-800', icon: AlertCircle },
};

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  tone?: 'info' | 'success' | 'warning' | 'danger';
  title?: ReactNode;
  /** A button or link at the end, e.g. "Resend". */
  action?: ReactNode;
}

/** An inline message inside the page: form errors, notices, banners. For transient feedback use `toast`. */
export default function Alert({ tone = 'info', title, action, children, className = '', ...props }: AlertProps) {
  const { classes, icon: Icon } = tones[tone];

  return (
    <div
      role={tone === 'danger' ? 'alert' : 'status'}
      className={`flex items-start gap-3 rounded-control border px-4 py-3 text-sm ${classes} ${className}`}
      {...props}
    >
      <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={title ? 'mt-0.5' : ''}>{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
