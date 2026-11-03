import type { ReactNode } from 'react';
import { Label } from '../ui';

interface SectionProps {
  title: string;
  /** Shown at the right of the heading; plain strings render as a muted note. */
  aside?: ReactNode;
  children: ReactNode;
}

export default function Section({ title, aside, children }: SectionProps) {
  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between border-b border-border pb-2">
        <h2 className="font-display text-2xl font-bold text-ink">{title}</h2>
        {typeof aside === 'string' ? <span className="text-xs text-muted">{aside}</span> : aside}
      </header>
      {children}
    </section>
  );
}

interface DemoGroupProps {
  label: string;
  children: ReactNode;
  className?: string;
}

/** A labelled block inside a section card. */
export function DemoGroup({ label, children, className = 'space-y-2' }: DemoGroupProps) {
  return (
    <div className={className}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
