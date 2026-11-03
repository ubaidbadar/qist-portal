import { Pencil, UserPlus } from 'lucide-react';
import type { Branch, User } from '@shop/shared';
import { Button, Drawer, IconButton } from '../../ui';
import MemberForm from './member_form';

interface MemberDrawerProps {
  member?: User;
  branches: Branch[];
}

/** "Add member" button, or the edit button of a team row; both open the same form. */
export default function MemberDrawer({ member, branches }: MemberDrawerProps) {
  return (
    <Drawer
      title={member ? `Edit ${member.fullName}` : 'Add team member'}
      component={({ open }) =>
        member ? (
          <IconButton icon={Pencil} aria-label={`Edit ${member.fullName}`} onClick={open} />
        ) : (
          <Button icon={UserPlus} onClick={open} disabled={branches.length === 0}>
            Add member
          </Button>
        )
      }
    >
      {(close) => <MemberForm member={member} branches={branches} onDone={close} />}
    </Drawer>
  );
}
