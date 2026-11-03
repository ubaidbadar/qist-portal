import { NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { BottomSheet } from '../../ui';
import type { NavItem } from '../nav_items';
import useNavItems from '../useNavItems';

const TAB_CLASSES = 'flex flex-col items-center gap-1 py-2 text-xs font-medium transition-colors duration-150';
const tabTone = (isActive: boolean) => (isActive ? 'text-accent' : 'text-muted hover:text-ink');

/** Bottom tab bar below lg: the primary pages plus a "More" sheet for the rest. */
export default function MobileNav() {
  const navItems = useNavItems();
  const primaryItems = navItems.filter((item) => item.primary);
  const moreItems = navItems.filter((item) => !item.primary);

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      {primaryItems.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `${TAB_CLASSES} ${tabTone(isActive)}`}>
          <item.icon size={20} aria-hidden="true" />
          {item.label}
        </NavLink>
      ))}

      <BottomSheet
        component={({ open }) => (
          <button type="button" onClick={open} className={`${TAB_CLASSES} ${tabTone(false)} cursor-pointer`}>
            <Menu size={20} aria-hidden="true" />
            More
          </button>
        )}
      >
        {(close) => (
          <ul className="space-y-1">
            {moreItems.map((item) => (
              <li key={item.to}>
                <MoreLink item={item} onNavigate={close} />
              </li>
            ))}
          </ul>
        )}
      </BottomSheet>
    </nav>
  );
}

function MoreLink({ item: { to, label, icon: Icon }, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  return (
    <NavLink
      to={to}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-control px-3 py-3 text-sm font-medium ${isActive ? 'bg-accent/10 text-accent' : 'text-body hover:bg-border/60'}`
      }
    >
      <Icon size={18} aria-hidden="true" />
      {label}
    </NavLink>
  );
}
