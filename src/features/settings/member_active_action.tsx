import { UserCheck, UserX } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '@shop/shared';
import { AlertModal, ConfirmModal, IconButton, toast } from '../../ui';
import { apiPatch } from '../../config/api';
import { membersQuery } from './queries';

/** Deactivate (destructive, confirmed with the consequence spelled out) or reactivate a team member. */
export default function MemberActiveAction({ member }: { member: User }) {
  const queryClient = useQueryClient();
  const setActive = useMutation({
    mutationFn: (active: boolean) => apiPatch<User>(`/users/${member._id}/active`, { active }),
    onSuccess: (updated) => {
      toast.success(updated.active ? `${updated.fullName} can sign in again` : `${updated.fullName} was signed out and can't sign in`);
      return queryClient.invalidateQueries({ queryKey: membersQuery.queryKey });
    },
  });

  if (member.active) {
    return (
      <AlertModal
        title={`Deactivate ${member.fullName}?`}
        description="They are signed out on every device at once and can't sign in again until reactivated. Their past work stays in the records."
        confirmText="Deactivate"
        onConfirm={() => setActive.mutate(false)}
        component={({ open }) => <IconButton icon={UserX} aria-label={`Deactivate ${member.fullName}`} onClick={open} />}
      />
    );
  }

  return (
    <ConfirmModal
      title={`Reactivate ${member.fullName}?`}
      description="They can sign in again with their current password."
      confirmText="Reactivate"
      onConfirm={() => setActive.mutate(true)}
      component={({ open }) => <IconButton icon={UserCheck} aria-label={`Reactivate ${member.fullName}`} onClick={open} />}
    />
  );
}
