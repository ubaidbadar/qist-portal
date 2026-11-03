import { Search } from 'lucide-react';
import { IconButton } from '../../ui';
import CommandPalette from '../command_palette/modal';
import Brand from './brand';
import BranchSwitcher from './branch_switcher';
import ThemeToggle from './theme_toggle';
import UserMenu from './user_menu';

export default function MobileTopBar() {
  return (
    <div className="flex items-center gap-2 border-b border-border bg-surface px-4 py-2 lg:hidden">
      <Brand collapsed />
      <BranchSwitcher className="min-w-0 flex-1" />
      <div className="flex shrink-0 items-center gap-1">
        <CommandPalette component={({ open }) => <IconButton icon={Search} aria-label="Search" onClick={open} />} />
        <ThemeToggle />
        <UserMenu compact />
      </div>
    </div>
  );
}
