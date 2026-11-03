import type { ReactNode } from 'react';
import { ChevronRight, Edit, Heart, Send, Share2, Sparkles, Trash2 } from 'lucide-react';
import { Badge, Button, Card, IconButton, toast, type ButtonProps } from '../ui';
import Section from './section';
import DeleteStemAlert from './overlays/delete_stem_alert';

const VARIANTS: { variant: ButtonProps['variant']; label: string }[] = [
  { variant: 'primary', label: 'Primary Button' },
  { variant: 'secondary', label: 'Secondary Button' },
  { variant: 'outline', label: 'Outline Button' },
  { variant: 'ghost', label: 'Ghost Button' },
  { variant: 'link', label: 'Link Button' },
  { variant: 'danger', label: 'Danger Button' },
  { variant: 'premium', label: 'Premium Button' },
];

export default function ButtonsSection() {
  return (
    <Section title="Buttons & Icon Buttons" aside={<Badge variant="primary">useFormStatus Enabled</Badge>}>
      <Card className="space-y-6">
        <DemoRow title="Variants">
          {VARIANTS.map(({ variant, label }) => (
            <Button key={label} variant={variant}>
              {label}
            </Button>
          ))}
          <Button variant="primary" loading>
            Loading Button
          </Button>
          <Button variant="primary" disabled>
            Disabled
          </Button>
        </DemoRow>

        <DemoRow title="Sizes & Icons">
          <Button size="sm" icon={Send} iconPosition="left">
            Small
          </Button>
          <Button size="md" icon={Sparkles} iconPosition="left">
            Medium
          </Button>
          <Button size="lg" icon={ChevronRight} iconPosition="right">
            Large
          </Button>
        </DemoRow>

        <DemoRow title="Icon Buttons">
          <IconButton icon={Heart} variant="ghost" size="sm" aria-label="Like" onClick={() => toast.info('Liked!')} />
          <IconButton
            icon={Share2}
            variant="outline"
            size="md"
            aria-label="Share"
            onClick={() => toast.info('Share clicked')}
          />
          <IconButton icon={Edit} variant="secondary" size="md" aria-label="Edit" />
          <DeleteStemAlert
            component={({ open }) => (
              <IconButton icon={Trash2} variant="danger" size="lg" aria-label="Delete" onClick={open} />
            )}
          />
        </DemoRow>
      </Card>
    </Section>
  );
}

function DemoRow({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted">{title}</h3>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}
