import { useState } from 'react';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { IconButton } from '../../ui';
import CommandPalette from '../command_palette/modal';
import SearchButton from '../command_palette/search_button';
import useNavItems from '../useNavItems';
import Brand from './brand';
import BranchSwitcher from './branch_switcher';
import SidebarLink from './sidebar_link';
import ThemeToggle from './theme_toggle';
import UserMenu from './user_menu';

const COLLAPSED_KEY = 'shop_sidebar_collapsed';

/** Desktop navigation. Always mounted (hidden below lg) so its Ctrl/Cmd+K shortcut works at any width. */
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSED_KEY) === 'true');
  const navItems = useNavItems();

  const toggleCollapsed = () => {
    localStorage.setItem(COLLAPSED_KEY, String(!collapsed));
    setCollapsed(!collapsed);
  };

  return (
    <aside
      className={`sticky top-0 hidden h-dvh shrink-0 flex-col gap-4 border-r border-border bg-surface p-3 transition-[width] duration-200 ease-out motion-reduce:transition-none lg:flex ${
        collapsed ? 'w-17' : 'w-60'
      }`}
    >
      <div className="px-1.5 pt-1">
        <Brand collapsed={collapsed} />
      </div>

      {!collapsed && <BranchSwitcher />}

      <CommandPalette component={({ open }) => <SearchButton open={open} collapsed={collapsed} />} />

      <nav aria-label="Main" className="flex-1 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.to}>
              <SidebarLink item={item} collapsed={collapsed} />
            </li>
          ))}
        </ul>
      </nav>

      <div className={`flex items-center gap-1 border-t border-border pt-3 ${collapsed ? 'flex-col' : 'justify-between'}`}>
        <UserMenu compact={collapsed} />
        <ThemeToggle />
        <IconButton
          icon={collapsed ? PanelLeftOpen : PanelLeftClose}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-expanded={!collapsed}
          onClick={toggleCollapsed}
        />
      </div>
    </aside>
  );
}
