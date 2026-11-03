import { Accordion, Avatar, Card } from '../ui';
import Section from './section';

const FAQ = [
  {
    id: 'faq-1',
    title: 'What sets this audio spatialization apart?',
    content:
      'Our engine models HRTF response curves in real time, delivering authentic room depth without phase cancellation.',
  },
  {
    id: 'faq-2',
    title: 'How does the React 19 architecture benefit performance?',
    content:
      'With React 19 Actions, transitions, and the React Compiler, unnecessary re-render passes are eliminated automatically.',
  },
  {
    id: 'faq-3',
    title: 'Are external event listeners cleaned up automatically?',
    content:
      'Yes! All scroll, resize, escape key, and mouse outside listeners are attached conditionally only while panels or popovers are open.',
  },
];

const DEFAULT_OPEN = ['faq-1'];

export default function AccordionSection() {
  return (
    <Section title="Accordion & Avatars">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Accordion allowMultiple defaultOpenIds={DEFAULT_OPEN} items={FAQ} className="self-start" />

        <Card className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-ink">Avatar Displays</h3>
          <div className="flex flex-wrap items-center gap-4">
            <Avatar size="sm" initials="ER" />
            <Avatar size="md" initials="TN" />
            <Avatar size="lg" initials="AU" />
            <Avatar
              size="xl"
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80"
              alt="Elena"
            />
            <Avatar size="md" alt="Fallback User" />
          </div>
          <p className="text-xs text-muted">
            Graceful fallback to initials or icon on image load failure, with automatic error reset when prop changes.
          </p>
        </Card>
      </div>
    </Section>
  );
}
