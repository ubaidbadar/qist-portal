import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import Calendar from './calendar';
import { useAnchoredPosition, type Placement } from '../hooks/useAnchoredPosition';
import { useDismiss } from '../hooks/useDismiss';

const GAP = 8;
const VIEWPORT_MARGIN = 16;

export interface DatePickerProps {
  selected?: string; // ISO string
  onChange?: (date: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function DatePicker({
  selected,
  onChange,
  placeholder = 'Pick a date',
  disabled = false,
  className = '',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedDate = selected ? new Date(selected) : undefined;
  const validDate = selectedDate && !isNaN(selectedDate.getTime()) ? selectedDate : undefined;

  const placePopover: Placement = (trigger, popover) => {
    // Once the trigger has scrolled out of view the popover has nothing to anchor to.
    if (trigger.bottom < 0 || trigger.top > window.innerHeight) {
      setIsOpen(false);
      return null;
    }

    const spaceBelow = window.innerHeight - trigger.bottom;
    const fitsBelow = spaceBelow >= popover.height || spaceBelow >= trigger.top;
    const maxLeft = window.innerWidth - popover.width - VIEWPORT_MARGIN;

    return {
      top: fitsBelow ? trigger.bottom + GAP : trigger.top - popover.height - GAP,
      left: Math.max(VIEWPORT_MARGIN, Math.min(trigger.left, maxLeft)),
    };
  };

  const { anchorRef, floatingRef, floatingStyle } = useAnchoredPosition<HTMLButtonElement>(isOpen, placePopover);

  useDismiss(isOpen, [anchorRef, floatingRef], (reason) => {
    setIsOpen(false);
    if (reason === 'escape') anchorRef.current?.focus();
  });

  const handleSelect = (date: Date) => {
    onChange?.(date.toISOString());
    setIsOpen(false);
  };

  return (
    <>
      <button
        ref={anchorRef}
        type="button"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between px-3 py-2.5 bg-canvas border border-border rounded-small text-sm text-ink hover:border-accent/50 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <span className={validDate ? 'font-medium' : 'text-muted'}>
          {validDate ? format(validDate, 'PPP') : placeholder}
        </span>
        <CalendarIcon size={16} className="text-muted" aria-hidden="true" />
      </button>

      {isOpen &&
        createPortal(
          <div ref={floatingRef} className="z-100 animate-pop-in motion-reduce:animate-none" style={floatingStyle}>
            <Calendar selected={validDate} onSelect={handleSelect} />
          </div>,
          document.body,
        )}
    </>
  );
}
