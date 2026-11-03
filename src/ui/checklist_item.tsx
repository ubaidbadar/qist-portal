import { Check } from 'lucide-react';

export type ChecklistStatus = 'done' | 'active' | 'pending';

// One indicator element per state; the active dot is the background clipped to the content box.
const indicators = {
  done: 'bg-accent text-surface',
  active: 'border-2 border-accent bg-accent bg-clip-content p-1.25',
  pending: 'border-[1.5px] border-border',
};

const statusLabels = { done: 'Completed', active: 'In progress', pending: 'Not started' };

interface ChecklistItemProps {
  label: string;
  status: ChecklistStatus;
}

/** A row of a checklist; render inside a `<ul>` (separators come from the list, e.g. `divide-y divide-border`). */
export default function ChecklistItem({ label, status }: ChecklistItemProps) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <span className={`grid size-5.5 shrink-0 place-items-center rounded-full ${indicators[status]}`}>
        {status === 'done' && <Check size={13} aria-hidden="true" />}
      </span>
      <span className={`text-sm ${status === 'pending' ? 'text-subtle' : 'text-ink'}`}>
        {label}
        <span className="sr-only"> ({statusLabels[status]})</span>
      </span>
    </li>
  );
}
