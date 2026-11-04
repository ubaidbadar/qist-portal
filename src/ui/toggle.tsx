import { useId, type InputHTMLAttributes } from 'react';

export interface ToggleProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
}

export default function Toggle({ className = '', label, id, ...props }: ToggleProps) {
  const generatedId = useId();
  const toggleId = id || generatedId;

  return (
    <label
      htmlFor={toggleId}
      className={`inline-flex items-center gap-3 cursor-pointer has-disabled:opacity-50 has-disabled:cursor-not-allowed ${className}`}
    >
      <input id={toggleId} type="checkbox" role="switch" className="peer sr-only" {...props} />
      {/* Track; the knob is its ::after. The input is visually hidden, so the track shows its focus. */}
      <span
        aria-hidden="true"
        className="relative h-6 w-11 shrink-0 rounded-full bg-border transition-colors peer-checked:bg-accent peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent after:absolute after:top-0.5 after:left-0.5 after:size-5 after:rounded-full after:border after:border-muted after:bg-on-accent after:transition after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-on-accent"
      />
      {label && <span className="text-sm font-medium text-ink select-none">{label}</span>}
    </label>
  );
}
