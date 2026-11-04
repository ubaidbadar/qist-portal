import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import Card from './card';

const tones = {
  neutral: 'bg-border text-ink',
  accent: 'bg-accent/10 text-accent',
  success: 'bg-success-100 text-success-800',
  warning: 'bg-warning-100 text-warning-800',
  danger: 'bg-danger-100 text-danger-800',
};

export interface StatCardProps {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  /** A short line under the value, e.g. "3 contracts". */
  hint?: ReactNode;
  tone?: keyof typeof tones;
}

export default function StatCard({ label, value, icon: Icon, hint, tone = 'neutral' }: StatCardProps) {
  return (
    <Card className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm text-muted">{label}</p>
        <p className="mt-1 break-words text-2xl font-semibold tracking-tight text-ink tabular-nums">{value}</p>
        {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      </div>
      <span className={`flex size-10 shrink-0 items-center justify-center rounded-control ${tones[tone]}`}>
        <Icon size={20} aria-hidden="true" />
      </span>
    </Card>
  );
}
