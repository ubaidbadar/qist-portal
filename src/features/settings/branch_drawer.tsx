import { Pencil, Plus } from 'lucide-react';
import type { Branch } from '@shop/shared';
import { Button, Drawer, IconButton } from '../../ui';
import BranchForm from './branch_form';

/** "Add branch" button, or the edit button of a branch row; both open the same form. */
export default function BranchDrawer({ branch }: { branch?: Branch }) {
  return (
    <Drawer
      title={branch ? `Edit ${branch.name}` : 'Add branch'}
      component={({ open }) =>
        branch ? (
          <IconButton icon={Pencil} aria-label={`Edit ${branch.name}`} onClick={open} />
        ) : (
          <Button icon={Plus} onClick={open}>
            Add branch
          </Button>
        )
      }
    >
      {(close) => <BranchForm branch={branch} onDone={close} />}
    </Drawer>
  );
}
