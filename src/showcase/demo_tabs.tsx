import { useState } from 'react';
import { Badge, ProgressBar, Tabs } from '../ui';
import { sessionStore } from '../auth';
import { useStore } from '../utils/store';

export default function DemoTabs() {
  // Lives here rather than in AnalyticsTab, which unmounts whenever another tab is selected.
  const [buffer, setBuffer] = useState(68);

  return (
    <Tabs
      tabs={[
        { id: 'overview', label: 'System Overview', content: <OverviewTab /> },
        {
          id: 'analytics',
          label: 'Acoustic Analytics',
          content: (
            <AnalyticsTab buffer={buffer} onIncrement={() => setBuffer((prev) => (prev >= 100 ? 20 : prev + 15))} />
          ),
        },
        { id: 'security', label: 'Security & Auth', content: <SecurityTab /> },
      ]}
    />
  );
}

function OverviewTab() {
  return (
    <div className="space-y-2 text-sm text-body">
      <p>
        Welcome to the system overview. All components are optimized for minimal re-renders and maximum
        bundle efficiency.
      </p>
      <div className="flex gap-2 pt-2">
        <Badge variant="success">Engine Nominal</Badge>
        <Badge variant="secondary">Zero Stale Closures</Badge>
      </div>
    </div>
  );
}

interface AnalyticsTabProps {
  buffer: number;
  onIncrement: () => void;
}

function AnalyticsTab({ buffer, onIncrement }: AnalyticsTabProps) {
  return (
    <div className="space-y-3 text-sm text-body">
      <p>Real-time telemetry and listener engagement metrics:</p>
      <ProgressBar value={buffer} ariaLabel="Streaming buffer percentage" />
      <div className="flex justify-between text-xs text-muted">
        <span>Buffer: {buffer}%</span>
        <button type="button" className="font-medium text-accent hover:underline cursor-pointer" onClick={onIncrement}>
          Increment Buffer
        </button>
      </div>
    </div>
  );
}

function SecurityTab() {
  const { status } = useStore(sessionStore);

  return (
    <div className="space-y-2 text-sm text-body">
      <p>
        Session: <strong>{status === 'signed_in' ? 'Signed in' : 'Signed out'}</strong>
      </p>
      <p className="text-xs text-muted">The access token lives in memory only; a reload restores it from the refresh cookie.</p>
    </div>
  );
}
