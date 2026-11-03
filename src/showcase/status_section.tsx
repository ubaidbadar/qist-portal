import { Badge, Card, ChecklistItem, InfoCard, Tag, type BadgeProps, type ChecklistStatus } from '../ui';
import Section from './section';

const BADGES: { variant: BadgeProps['variant']; label: string }[] = [
  { variant: 'primary', label: 'Primary' },
  { variant: 'secondary', label: 'Gold Secondary' },
  { variant: 'success', label: 'Success' },
  { variant: 'warning', label: 'Warning' },
  { variant: 'error', label: 'Error' },
  { variant: 'info', label: 'Info' },
  { variant: 'critical', label: 'Critical' },
  { variant: 'neutral', label: 'Neutral' },
];

const TAGS = ['24-bit Flac', 'Dolby Atmos', 'Master Audio'];

const CHECKLIST: { label: string; status: ChecklistStatus }[] = [
  { label: 'Register artist account', status: 'done' },
  { label: 'Upload high-res audio stems', status: 'done' },
  { label: 'Configure spatial room acoustics', status: 'active' },
  { label: 'Publish to global catalog', status: 'pending' },
];

export default function StatusSection() {
  return (
    <Section title="Badges, Tags & Status">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="space-y-4">
          <h3 className="font-display text-lg font-semibold text-ink">Badge Palette</h3>
          <div className="flex flex-wrap gap-2">
            {BADGES.map(({ variant, label }) => (
              <Badge key={label} variant={variant}>
                {label}
              </Badge>
            ))}
            <Badge variant="secondary" pill>
              Pill Shape
            </Badge>
          </div>

          <div className="pt-2">
            <h4 className="mb-2 text-xs font-semibold uppercase text-muted">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </div>
          </div>
        </Card>

        <Card className="space-y-3">
          <h3 className="font-display text-lg font-semibold text-ink">Onboarding Checklist</h3>
          <ul className="divide-y divide-border">
            {CHECKLIST.map((item) => (
              <ChecklistItem key={item.label} {...item} />
            ))}
          </ul>
        </Card>

        <InfoCard title="Audio Fidelity Insight">
          <p className="text-sm text-body leading-relaxed">
            The engine reproduces high-dynamic-range soundscapes. Every stem is calibrated to guarantee zero compression
            artifacts across audiophile output devices.
          </p>
        </InfoCard>
      </div>
    </Section>
  );
}
