import { useState } from 'react';
import { Button, Calendar, Card, DatePicker, ExpandableText, Tooltip, toast } from '../ui';
import Section, { DemoGroup } from './section';

const TOOLTIP_DEMOS = [
  { position: 'top', label: 'Top Tooltip' },
  { position: 'bottom', label: 'Bottom Tooltip' },
  { position: 'left', label: 'Left' },
  { position: 'right', label: 'Right' },
] as const;

const ABOUT_TEXT =
  'This platform was crafted for creators who refuse to compromise on sonic clarity. Behind every note lies meticulous algorithmic modeling, proprietary psychoacoustic filtering, and studio-grade mastering workflows designed from the ground up.';

export default function DateSection() {
  return (
    <Section title="Calendar & DatePicker" aside="Clean Event Handlers">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="flex flex-col items-center justify-center">
          <div className="mb-3 text-sm font-medium text-muted">Interactive Month Calendar</div>
          <CalendarDemo />
        </Card>

        <Card className="space-y-6">
          <DemoGroup label="Popover DatePicker" className="">
            <DatePickerDemo />
          </DemoGroup>

          <DemoGroup label="Expandable Content" className="space-y-2 pt-2">
            <ExpandableText text={ABOUT_TEXT} maxLines={2} />
          </DemoGroup>

          <DemoGroup label="Interactive Tooltips" className="space-y-2 pt-2">
            <div className="flex flex-wrap gap-4">
              {TOOLTIP_DEMOS.map(({ position, label }) => (
                <Tooltip key={position} content={`Tooltip positioned on ${position}`} position={position}>
                  <Button variant="outline" size="sm">
                    {label}
                  </Button>
                </Tooltip>
              ))}
            </div>
          </DemoGroup>
        </Card>
      </div>
    </Section>
  );
}

function CalendarDemo() {
  const [date, setDate] = useState<Date | undefined>(() => new Date());

  return (
    <Calendar
      selected={date}
      onSelect={(d) => {
        setDate(d);
        toast.info(`Selected date: ${d.toDateString()}`);
      }}
    />
  );
}

function DatePickerDemo() {
  const [date, setDate] = useState(() => new Date().toISOString());

  return (
    <DatePicker
      selected={date}
      onChange={(d) => {
        setDate(d);
        toast.success('Broadcast schedule updated');
      }}
    />
  );
}
