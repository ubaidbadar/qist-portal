import type { ReactNode } from 'react';
import { Card } from '../../ui';
/** Shared header, body and save footer for the organization and document settings forms. */
export default function SettingsCard({
  title,
  description,
  children,
  footer,
}: {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Card padding="none" className="max-w-4xl overflow-hidden">
      <header className="border-b border-border px-5 py-4 sm:px-6">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </header>
      <div className="space-y-6 p-5 sm:p-6">{children}</div>
      {footer && (
        <footer className="flex flex-wrap items-center justify-end gap-3 border-t border-border bg-surface px-5 py-3 sm:px-6">
          {footer}
        </footer>
      )}
    </Card>
  );
}
