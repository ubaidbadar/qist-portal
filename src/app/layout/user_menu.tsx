import { Download, KeyRound, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CHANGE_PASSWORD_PATH, logOut, useMe } from '../../auth';
import { Avatar, DropdownMenu } from '../../ui';
import { useStore } from '../../utils/store';
import { canInstallOnIos, installPortal, pwaStore } from '../../pwa/runtime';
import { initialsOf, ROLE_LABELS } from '../../shared/labels';

/** The signed-in person: change password and sign out. `compact` shows the avatar only. */
export default function UserMenu({ compact = false }: { compact?: boolean }) {
  const { user } = useMe();
  const navigate = useNavigate();
  const { install, installed } = useStore(pwaStore);
  const showInstall = !installed && (install || canInstallOnIos());

  return (
    <DropdownMenu
      align="left"
      items={[
        ...(showInstall ? [{ label: 'Install Qist app', icon: Download, onClick: () => void installPortal() }] : []),
        { label: 'Change password', icon: KeyRound, onClick: () => navigate(CHANGE_PASSWORD_PATH) },
        { label: 'Sign out', icon: LogOut, danger: true, onClick: () => void logOut() },
      ]}
      trigger={
        <button
          type="button"
          aria-haspopup="menu"
          aria-label={`Account menu for ${user.fullName}`}
          className="flex min-w-0 cursor-pointer items-center gap-2.5 rounded-control p-1 text-left transition-colors duration-150 hover:bg-border/60"
        >
          <Avatar initials={initialsOf(user.fullName)} alt="" size="sm" />
          {!compact && (
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-ink">{user.fullName}</span>
              <span className="block truncate text-xs text-muted">{ROLE_LABELS[user.role]}</span>
            </span>
          )}
        </button>
      }
    />
  );
}
