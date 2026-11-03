import { NavLink } from 'react-router-dom';
import { Tooltip } from '../../ui';
import type { NavItem } from '../nav_items';

interface SidebarLinkProps {
  item: NavItem;
  collapsed: boolean;
}

export default function SidebarLink({ item: { to, label, icon: Icon }, collapsed }: SidebarLinkProps) {
  const link = (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        `relative flex min-h-12 items-center gap-3 rounded-control px-3 text-sm -outline-offset-2 ${collapsed ? 'justify-center' : ''} transition-colors duration-150 ${
          isActive ? 'bg-brand-raised font-semibold text-on-brand'
            : 'font-medium text-brand-muted hover:bg-brand-raised hover:text-on-brand'
        }`
      }
    >
      <Icon size={18} className="shrink-0" aria-hidden="true" />
      <span className={collapsed ? 'sr-only' : 'truncate'}>{label}</span>
    </NavLink>
  );

  if (!collapsed) return link;

  return (
    <Tooltip content={label} position="right" className="block">
      {link}
    </Tooltip>
  );
}
