import { Check } from 'lucide-react';

const STEPS = ['Customer', 'Phone', 'Terms & review'] as const;

interface SaleProgressProps {
  current: number;
  onBack: (step: number) => void;
}

/** Connected steps keep labels readable on narrow screens; only completed steps navigate. */
export default function SaleProgress({ current, onBack }: SaleProgressProps) {
  return (
    <ol aria-label="Contract setup progress" className="grid grid-cols-3">
      {STEPS.map((label, index) => {
        const active = current === index;
        const completed = index < current;
        return (
          <li
            key={label}
            className={`relative min-w-0 before:absolute before:start-1/2 before:top-5 before:h-0.5 before:w-full before:content-[''] last:before:hidden ${
              completed ? 'before:bg-primary' : 'before:bg-border'
            }`}
          >
            <button
              type="button"
              disabled={!completed}
              aria-current={active ? 'step' : undefined}
              aria-label={completed ? `${label}, completed. Go back` : label}
              onClick={() => onBack(index)}
              className={`relative flex min-h-20 w-full min-w-0 flex-col items-center gap-2 px-1 pb-1 text-center text-xs sm:text-sm ${
                active ? 'font-semibold text-ink' : completed ? 'cursor-pointer font-medium text-body' : 'font-medium text-muted'
              }`}
            >
              <span className={`grid size-10 shrink-0 place-items-center rounded-full border-2 text-sm font-semibold transition-colors ${
                active || completed
                  ? 'border-primary bg-primary text-on-primary'
                  : 'border-border bg-canvas text-muted'
              }`}>
                {completed ? <Check size={18} strokeWidth={2.5} aria-hidden="true" /> : index + 1}
              </span>
              <span className="max-w-full text-balance leading-5">{label}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
