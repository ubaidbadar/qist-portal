import { ExternalLink } from 'lucide-react';
import { AccentWord, Badge, DropdownMenu, Tooltip, toast, type DropdownMenuItem } from '../ui';
import useBreakpoints from '../hooks/useBreakpoints';

const BREAKPOINT_KEYS = ['sm', 'md', 'lg', 'xl'] as const;

const ACCOUNT_ACTIONS: DropdownMenuItem[] = [
  {
    label: 'View Project Documentation',
    icon: ExternalLink,
    onClick: () => toast.info('Navigating to documentation...'),
  },
];

export default function ShowcaseHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="font-display text-2xl font-bold tracking-tight text-ink">
            Base <AccentWord>Design System</AccentWord>
          </span>
          <Badge variant="secondary" pill>
            React 19.x Ready
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <BreakpointIndicator />
          <DropdownMenu items={ACCOUNT_ACTIONS} />
        </div>
      </div>
    </header>
  );
}

/** Isolated so window resizes re-render only this badge. */
function BreakpointIndicator() {
  const breakpoints = useBreakpoints();
  const active = BREAKPOINT_KEYS.filter((key) => breakpoints[key]).map((key) => key.toUpperCase());

  return (
    <Tooltip content="Current active viewport breakpoints" position="bottom">
      <span className="rounded-small border border-border bg-surface px-2.5 py-1 text-xs font-mono text-muted">
        {breakpoints.width}px [{active.join(' ')}]
      </span>
    </Tooltip>
  );
}
