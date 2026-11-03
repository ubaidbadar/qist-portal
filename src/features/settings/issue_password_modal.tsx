import { KeyRound } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { User, UserWithTemporaryPassword } from '@shop/shared';
import { Button, IconButton, Modal } from '../../ui';
import { apiPost } from '../../config/api';
import { membersQuery } from './queries';
import TemporaryPasswordNotice from './temporary_password_notice';

/** For someone who forgot their password and has no access to email. */
export default function IssuePasswordModal({ member }: { member: User }) {
  return (
    <Modal
      title="New temporary password"
      component={({ open }) => (
        <IconButton icon={KeyRound} aria-label={`New temporary password for ${member.fullName}`} onClick={open} />
      )}
    >
      {(close) => <IssuePasswordBody member={member} onDone={close} />}
    </Modal>
  );
}

function IssuePasswordBody({ member, onDone }: { member: User; onDone: () => void }) {
  const queryClient = useQueryClient();
  const issue = useMutation({
    mutationFn: () => apiPost<UserWithTemporaryPassword>(`/users/${member._id}/temporary-password`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: membersQuery.queryKey }),
  });

  if (issue.data) return <TemporaryPasswordNotice result={issue.data} onDone={onDone} />;

  return (
    <div className="space-y-5">
      <p className="text-sm text-body">
        {member.fullName}'s current password stops working and they are signed out on every device. You'll see the new
        password once, to hand over to them.
      </p>
      <div className="flex justify-end gap-3">
        <Button variant="ghost" onClick={onDone} disabled={issue.isPending}>
          Cancel
        </Button>
        <Button loading={issue.isPending} onClick={() => issue.mutate()}>
          Issue password
        </Button>
      </div>
    </div>
  );
}
