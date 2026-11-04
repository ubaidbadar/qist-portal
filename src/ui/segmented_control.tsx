import { useId } from 'react';
import { useControllableState } from '../hooks/useControllableState';

export interface SegmentedControlProps {
  options: string[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
  'aria-label'?: string;
}

/** A native radio group: the browser provides arrow-key navigation, checked state and form semantics. */
export default function SegmentedControl({
  options,
  value,
  defaultValue,
  onChange,
  className = '',
  'aria-label': ariaLabel,
}: SegmentedControlProps) {
  const name = useId();
  const [selected, setSelected] = useControllableState(value, defaultValue || options[0] || '', onChange);

  if (options.length === 0) return null;

  const activeIndex = Math.max(0, options.indexOf(selected));

  return (
    <div role="radiogroup" aria-label={ariaLabel} className={`p-1 bg-border/40 rounded-pill inline-flex ${className}`}>
      <div className="relative grid w-full grid-flow-col auto-cols-fr">
        {/* Sliding background */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 bg-surface rounded-pill shadow-sm transition-transform duration-300 ease-emphasized border border-border/50 pointer-events-none motion-reduce:transition-none"
          style={{
            width: `${100 / options.length}%`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
        />

        {options.map((option) => (
          <label
            key={option}
            className="relative px-4 py-1.5 text-center text-sm font-medium text-muted transition-colors rounded-pill cursor-pointer hover:text-ink has-checked:text-ink has-focus-visible:outline-2 has-focus-visible:outline-accent"
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={option === selected}
              onChange={() => setSelected(option)}
              className="sr-only"
            />
            {option}
          </label>
        ))}
      </div>
    </div>
  );
}
