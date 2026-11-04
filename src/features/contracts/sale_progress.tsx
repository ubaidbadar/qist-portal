import { Check } from 'lucide-react';

const STEPS = ['Customer', 'Phone', 'Terms & review'] as const;

interface SaleProgressProps {
  current: number;
  onBack: (step: number) => void;
}

/** Completed steps are navigable; future steps remain gated by selection. */
export default function SaleProgress({ current, onBack }: SaleProgressProps) {
  return (
    <ol aria-label="Contract setup progress" className="grid grid-cols-3 gap-2 sm:gap-3">
      {STEPS.map((label, index) => {
        const active = current === index;
        const completed = index < current;
        return (
          <li key={label}>
            <button
              type="button"
              disabled={!completed}
              aria-current={active ? 'step' : undefined}
              onClick={() => onBack(index)}
              className={`flex min-h-15 w-full items-center gap-2 rounded-card border px-3 py-3 text-start text-sm transition-colors sm:gap-3 sm:px-4 ${
                active
                  ? 'border-accent bg-accent/10 font-semibold text-ink'
                  : completed
                    ? 'cursor-pointer border-success-200 bg-surface text-ink hover:bg-success-50'
                    : 'border-border bg-surface font-medium text-muted'
              }`}
            >
              <span className={`grid size-7 shrink-0 place-items-center rounded-pill text-xs font-bold ${
                active ? 'bg-accent text-on-accent' : completed ? 'bg-success-100 text-success-800' : 'bg-border text-muted'
              }`}>
                {completed ? <Check size={15} aria-hidden="true" /> : index + 1}
              </span>
              <span className="leading-tight">{label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
