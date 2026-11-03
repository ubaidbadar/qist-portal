import type { ReactNode } from 'react';

export interface Detail {
  label: string;
  value: ReactNode;
}

/** Label-value pairs for a record's details, two columns on wider screens. Empty values show a dash. */
export default function DetailList({ items }: { items: Detail[] }) {
  return (
    <dl className="grid gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
      {items.map(({ label, value }) => (
        <div key={label} className="min-w-0">
          <dt className="text-xs text-muted">{label}</dt>
          <dd className="mt-0.5 break-words text-ink">{value || '–'}</dd>
        </div>
      ))}
    </dl>
  );
}
