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
  /** Read by screen readers as the list's name. */
  label: string;
}

/** A list to pick one item from, used by the sale wizard's customer and phone steps. */
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
              className={`flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors duration-150 -outline-offset-2 ${
                selected ? 'bg-accent/10' : 'hover:bg-canvas'
              }`}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-ink">{choice.title}</span>
                <span className="block truncate text-sm text-muted">{choice.detail}</span>
              </span>
              {selected && <Check size={18} className="shrink-0 text-accent" aria-hidden="true" />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
