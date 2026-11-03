import { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  startOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  isBefore,
  startOfDay,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import IconButton from './icon_button';

const DAYS_SHOWN = 42; // six full weeks
const WEEKDAYS = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(new Date()), i));

export interface CalendarProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
}

export default function Calendar({ selected, onSelect, className = '' }: CalendarProps) {
  const [month, setMonth] = useState(() => startOfMonth(selected || new Date()));
  const today = startOfDay(new Date());
  const gridStart = startOfWeek(month);
  const days = Array.from({ length: DAYS_SHOWN }, (_, i) => addDays(gridStart, i));

  return (
    <div
      role="region"
      aria-label="Calendar"
      className={`p-4 bg-surface border border-border rounded-control shadow-lg w-fit font-body ${className}`}
    >
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="font-semibold text-ink tracking-tight">{format(month, 'MMMM yyyy')}</h2>
        <div className="flex gap-1">
          <MonthButton icon={ChevronLeft} label="Previous month" onClick={() => setMonth(subMonths(month, 1))} />
          <MonthButton icon={ChevronRight} label="Next month" onClick={() => setMonth(addMonths(month, 1))} />
        </div>
      </div>
      {/* Weekday headings and all days share one grid, so rows need no wrapper elements. */}
      <div className="grid grid-cols-7 gap-1">
        {WEEKDAYS.map((weekday) => (
          <abbr
            key={weekday.getDay()}
            title={format(weekday, 'EEEE')}
            className="pb-3 text-center text-xs font-medium text-muted no-underline"
          >
            {format(weekday, 'EEEEE')}
          </abbr>
        ))}
        {days.map((day) => (
          <CalendarDay
            key={day.toISOString()}
            day={day}
            isCurrentMonth={isSameMonth(day, month)}
            isSelected={selected ? isSameDay(day, selected) : false}
            isToday={isSameDay(day, today)}
            isPast={isBefore(day, today)}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}

interface MonthButtonProps {
  icon: typeof ChevronLeft;
  label: string;
  onClick: () => void;
}

function MonthButton({ icon, label, onClick }: MonthButtonProps) {
  return <IconButton icon={icon} onClick={onClick} variant="ghost" className="size-8 p-0!" aria-label={label} />;
}

interface CalendarDayProps {
  day: Date;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  isPast: boolean;
  onSelect?: (date: Date) => void;
}

function CalendarDay({ day, isCurrentMonth, isSelected, isToday, isPast, onSelect }: CalendarDayProps) {
  return (
    <button
      type="button"
      disabled={isPast}
      onClick={() => onSelect?.(day)}
      aria-label={format(day, 'PPPP')}
      aria-pressed={isSelected}
      aria-current={isToday ? 'date' : undefined}
      className={`size-9 rounded-full text-sm transition-colors ${dayStateClasses(isCurrentMonth, isSelected, isPast)}`}
    >
      {format(day, 'd')}
    </button>
  );
}

function dayStateClasses(isCurrentMonth: boolean, isSelected: boolean, isPast: boolean) {
  if (!isCurrentMonth) return 'text-muted/30';
  if (isSelected) return 'bg-accent text-on-accent font-semibold shadow-md ring-2 ring-accent/30 ring-offset-1 ring-offset-surface';
  if (isPast) return 'text-muted/30 cursor-not-allowed line-through decoration-muted/20';
  return 'text-ink hover:bg-accent/10 hover:text-accent font-medium cursor-pointer';
}
