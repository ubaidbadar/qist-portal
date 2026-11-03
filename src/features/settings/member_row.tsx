import type { Branch, User } from '@shop/shared';
import { Avatar, Badge } from '../../ui';
import { initialsOf, ROLE_LABELS } from '../../shared/labels';
import IssuePasswordModal from './issue_password_modal';
import MemberActiveAction from './member_active_action';
import MemberDrawer from './member_drawer';

interface MemberRowProps {
  member: User;
  /** Every branch, to name the member's branches even if one was deactivated. */
  branches: Branch[];
  /** Branches that can be assigned. */
  activeBranches: Branch[];
}

export default function MemberRow({ member, branches, activeBranches }: MemberRowProps) {
  const isOwner = member.role === 'owner';
  const branchNames = isOwner
    ? 'All branches'
    : branches
        .filter((branch) => member.branchIds.includes(branch._id))
        .map((branch) => branch.name)
        .join(', ');

  return (
    <li className={`flex flex-wrap items-center gap-3 px-5 py-4 ${member.active ? '' : 'opacity-60'}`}>
      <Avatar initials={initialsOf(member.fullName)} alt="" size="sm" />
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 font-medium text-ink">
          {member.fullName}
          <Badge variant={isOwner ? 'primary' : 'neutral'} pill>
            {ROLE_LABELS[member.role]}
          </Badge>
          {!member.active && (
            <Badge variant="error" pill>
              Deactivated
            </Badge>
          )}
          {member.active && member.mustChangePassword && (
            <Badge variant="warning" pill>
              Temporary password
            </Badge>
          )}
        </p>
        <p className="mt-0.5 truncate text-sm text-muted">
          {member.email} · {branchNames}
        </p>
      </div>
      {!isOwner && (
        <div className="flex items-center gap-1">
          <MemberDrawer member={member} branches={activeBranches} />
          {member.active && <IssuePasswordModal member={member} />}
          <MemberActiveAction member={member} />
        </div>
      )}
    </li>
  );
}
