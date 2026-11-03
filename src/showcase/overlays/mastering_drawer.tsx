import { Button, Drawer, ProgressBar } from '../../ui';
import type { DemoOverlayProps } from './types';

const METRICS = [
  { label: 'Integrated LUFS', value: '-14.2 LUFS' },
  { label: 'True Peak Max', value: '-1.0 dBFS' },
  { label: 'Dynamic Range', value: '11.4 LU' },
];

export default function MasteringDrawer({ component }: DemoOverlayProps) {
  return (
    <Drawer
      component={component}
      title="Mastering Inspector"
      width="md"
      footer={(close) => (
        <Button variant="primary" onClick={close}>
          Close Inspector
        </Button>
      )}
    >
      <div className="space-y-4 text-sm text-body">
        <p>Inspect real-time loudness (LUFS), true peak levels, and stereo correlation.</p>
        <div className="rounded-control border border-border bg-surface p-3 space-y-2">
          {METRICS.map(({ label, value }) => (
            <div key={label} className="flex justify-between text-xs">
              <span className="text-muted">{label}</span>
              <strong className="text-ink">{value}</strong>
            </div>
          ))}
        </div>
        <ProgressBar value={76} ariaLabel="Master level" />
      </div>
    </Drawer>
  );
}
