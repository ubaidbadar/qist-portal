import { matchPath, NavLink, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { BottomSheet } from '../../ui';
import type { NavItem } from '../nav_items';
import useNavItems from '../useNavItems';

const TAB_CLASSES = 'flex min-h-16 min-w-0 flex-col items-center justify-center gap-1 px-0.5 text-center text-xs leading-tight transition-colors duration-150';
const tabTone = (isActive: boolean) => (isActive ? 'font-semibold text-accent' : 'font-medium text-muted hover:text-ink');

/** Bottom tab bar below lg: the primary pages plus a "More" sheet for the rest. */
export default function MobileNav() {
  const navItems = useNavItems();
  const { pathname } = useLocation();
  const primaryItems = navItems.filter((item) => item.primary);
  const moreItems = navItems.filter((item) => !item.primary);
  const moreIsActive = moreItems.some((item) => matchPath({ path: item.to, end: false }, pathname));

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      {primaryItems.map((item) => (
        <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `${TAB_CLASSES} ${tabTone(isActive)}`}>
          {({ isActive }) => (
            <>
              <span className={`grid h-7 w-11 place-items-center rounded-pill ${isActive ? 'bg-accent/10' : ''}`}>
                <item.icon size={20} strokeWidth={isActive ? 2.25 : 1.75} aria-hidden="true" />
              </span>
              {item.label}
            </>
          )}
        </NavLink>
      ))}

      <BottomSheet
        component={({ open }) => (
          <button type="button" onClick={open} className={`${TAB_CLASSES} ${tabTone(moreIsActive)} cursor-pointer`}>
            <span className={`grid h-7 w-11 place-items-center rounded-pill ${moreIsActive ? 'bg-accent/10' : ''}`}>
              <Menu size={20} strokeWidth={1.75} aria-hidden="true" />
            </span>
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
