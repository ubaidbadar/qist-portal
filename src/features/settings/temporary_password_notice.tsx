import { Copy } from 'lucide-react';
import type { UserWithTemporaryPassword } from '@shop/shared';
import { Alert, Button, IconButton, toast } from '../../ui';

interface TemporaryPasswordNoticeProps {
  result: UserWithTemporaryPassword;
  onDone: () => void;
}

/** Shown once, right after a temporary password is created; it is never stored in readable form. */
export default function TemporaryPasswordNotice({ result: { user, temporaryPassword }, onDone }: TemporaryPasswordNoticeProps) {
  const copy = () =>
    navigator.clipboard.writeText(temporaryPassword).then(
      () => toast.success('Password copied'),
      () => toast.error("Couldn't copy. Select the password and copy it instead."),
    );

  return (
    <div className="space-y-4">
      <Alert tone="success" title={`${user.fullName} can sign in now`}>
        Give them their email and this temporary password. They will choose their own password when they first sign in.
      </Alert>
      <dl className="space-y-3 rounded-control border border-border bg-surface p-4 text-sm">
        <div>
          <dt className="text-muted">Email</dt>
          <dd className="font-medium text-ink">{user.email}</dd>
        </div>
        <div>
          <dt className="text-muted">Temporary password</dt>
          <dd className="flex items-center gap-2">
            <code className="font-mono text-lg tracking-wider text-ink">{temporaryPassword}</code>
            <IconButton icon={Copy} size="sm" aria-label="Copy password" onClick={() => void copy()} />
          </dd>
        </div>
      </dl>
      <Alert tone="warning">It won't be shown again. If it gets lost, issue a new one from the team list.</Alert>
      <Button onClick={onDone} className="w-full">
        Done
      </Button>
    </div>
  );
}
