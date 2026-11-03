import { Search } from 'lucide-react';
import { IconButton } from '../../ui';
import useHotkey from '../../hooks/useHotkey';

const SHORTCUT_LABEL = /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘K' : 'Ctrl K';

interface SearchButtonProps {
  open: () => void;
  collapsed: boolean;
}

/** The sidebar's palette trigger; it also owns the global Ctrl/Cmd+K shortcut. */
export default function SearchButton({ open, collapsed }: SearchButtonProps) {
  useHotkey('k', open);

  if (collapsed) {
    return <IconButton icon={Search} aria-label={`Search (${SHORTCUT_LABEL})`} onClick={open} className="self-center" />;
  }

  return (
    <button
      type="button"
      onClick={open}
      className="flex w-full cursor-pointer items-center gap-2 rounded-control border border-border bg-canvas px-3 py-2 text-sm text-muted transition-colors duration-150 hover:text-ink"
    >
      <Search size={16} aria-hidden="true" />
      Search
      <kbd className="ml-auto rounded-chip border border-border bg-surface px-1.5 font-body text-xs">{SHORTCUT_LABEL}</kbd>
    </button>
  );
}
