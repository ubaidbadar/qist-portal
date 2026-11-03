import { useMutation } from '@tanstack/react-query';
import { useMe } from '../../auth';
import { apiPost } from '../../config/api';
import { Alert, Button, toast } from '../../ui';

/**
 * Owners only: their email is how they recover the account (the link was sent at signup). Staff and managers
 * created by the owner get a new temporary password from the owner instead.
 */
export default function VerifyEmailBanner() {
  const { user } = useMe();
  const resend = useMutation({
    mutationFn: () => apiPost('/me/email-verification'),
    onSuccess: () => toast.success(`A new link is on its way to ${user.email}`),
  });

  if (user.emailVerifiedAt || user.role !== 'owner') return null;

  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:px-8">
      <Alert
        tone="warning"
        title="Confirm your email address"
        action={
          <Button size="sm" variant="ghost" loading={resend.isPending} onClick={() => resend.mutate()}>
            Resend link
          </Button>
        }
      >
        We sent a link to {user.email}. Confirming it lets you reset your password if you ever forget it.
      </Alert>
    </div>
  );
}
