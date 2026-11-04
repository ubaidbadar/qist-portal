import { Check } from 'lucide-react';

export interface Choice {
  key: string;
  title: string;
  detail: string;
}

interface ChoiceListProps {
  choices: Choice[];
  selectedKey: string | undefined;
  onChoose: (key: string) => void;
  label: string;
}

/** A consistent single-choice list for customers and stock phones. */
export default function ChoiceList({ choices, selectedKey, onChoose, label }: ChoiceListProps) {
  return (
    <ul aria-label={label} className="divide-y divide-border overflow-hidden rounded-card border border-border bg-surface">
      {choices.map((choice) => {
        const selected = choice.key === selectedKey;
        return (
          <li key={choice.key}>
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => onChoose(choice.key)}
              className={`flex min-h-18 w-full cursor-pointer items-center gap-3 px-4 py-4 text-start transition-colors duration-150 -outline-offset-2 sm:px-5 ${
                selected ? 'bg-accent/10' : 'hover:bg-canvas'
              }`}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-ink sm:text-base">{choice.title}</span>
                <span className="mt-1 block truncate text-sm text-muted">{choice.detail}</span>
              </span>
              {selected && (
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-pill bg-surface px-3 py-1 text-xs font-semibold text-accent">
                  <Check size={15} aria-hidden="true" />
                  Selected
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
