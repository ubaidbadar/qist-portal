import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Badge, Button, Card, ErrorBoundary } from '../ui';
import Section from './section';

export default function ErrorBoundarySection() {
  const [shouldCrash, setShouldCrash] = useState(false);

  return (
    <Section title="Error Boundary Resilience" aside={<Badge variant="warning">Crash Recovery</Badge>}>
      <Card className="space-y-4">
        <p className="text-sm text-body">
          Test how the design system isolates runtime rendering exceptions without unmounting the rest of your
          application tree:
        </p>

        <div className="flex gap-3">
          <Button variant={shouldCrash ? 'secondary' : 'danger'} onClick={() => setShouldCrash((prev) => !prev)}>
            {shouldCrash ? 'Reset Simulated Crash' : 'Simulate Runtime Exception'}
          </Button>
        </div>

        {/* Keyed so that toggling the crash off also gives the boundary a fresh start. */}
        <ErrorBoundary
          key={String(shouldCrash)}
          onReset={() => setShouldCrash(false)}
          fallback={(props) => <CrashFallback {...props} />}
        >
          <BuggyWidget shouldCrash={shouldCrash} />
        </ErrorBoundary>
      </Card>
    </Section>
  );
}

function BuggyWidget({ shouldCrash }: { shouldCrash: boolean }) {
  if (shouldCrash) {
    throw new Error('This is a simulated rendering crash to verify ErrorBoundary resilience!');
  }
  return (
    <div className="rounded-control border border-success-200 bg-success-50 p-4 text-xs font-medium text-success-800">
      Widget rendering healthy and nominal.
    </div>
  );
}

function CrashFallback({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="rounded-control border border-danger-200 bg-danger-50 p-4 text-sm text-danger-800">
      <div className="flex items-center gap-2 font-semibold">
        <AlertCircle size={16} /> Caught by ErrorBoundary
      </div>
      <p className="mt-1 text-xs text-danger-700">{error.message}</p>
      <button
        type="button"
        onClick={reset}
        className="mt-3 cursor-pointer rounded-small bg-danger-700 px-3 py-1.5 text-xs font-medium text-on-accent hover:bg-danger-800"
      >
        Recover Component
      </button>
    </div>
  );
}
