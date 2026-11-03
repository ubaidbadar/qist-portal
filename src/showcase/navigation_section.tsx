import { useState } from 'react';
import { Card, Pill, SegmentedControl } from '../ui';
import Section, { DemoGroup } from './section';
import DemoTabs from './demo_tabs';

const PERIODS = ['Daily', 'Weekly', 'Monthly', 'Quarterly'];
const GENRES = ['Classical', 'Baroque', 'Romantic', 'Modernist', 'Minimalism'];

export default function NavigationSection() {
  return (
    <Section title="Navigation, Tabs & Controls" aside="Keyboard Navigation Supported">
      <Card className="space-y-6">
        <DemoGroup label="Segmented Control (Controlled & Animated)">
          <PeriodControl />
        </DemoGroup>
        <DemoGroup label="Accessible Tabs (WAI-ARIA with Arrow Key Nav)">
          <DemoTabs />
        </DemoGroup>
        <DemoGroup label="Filter Pills">
          <GenrePills />
        </DemoGroup>
      </Card>
    </Section>
  );
}

function PeriodControl() {
  const [period, setPeriod] = useState('Weekly');
  return <SegmentedControl options={PERIODS} value={period} onChange={setPeriod} aria-label="Reporting period" />;
}

function GenrePills() {
  const [activeGenre, setActiveGenre] = useState('Classical');

  return (
    <div className="flex flex-wrap gap-2">
      {GENRES.map((genre) => (
        <Pill key={genre} isActive={activeGenre === genre} onClick={() => setActiveGenre(genre)}>
          {genre}
        </Pill>
      ))}
    </div>
  );
}
