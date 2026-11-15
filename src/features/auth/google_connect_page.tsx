import { useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import type { Me } from '@shop/shared';
import { ME_KEY, useMe } from '../../auth';
import { apiPost } from '../../config/api';
import { Alert } from '../../ui';
import getAxiosMessage from '../../utils/get_axios_message';
import AuthCard, { authLinkClasses } from './auth_card';
import GoogleSignInButton from './google_sign_in_button';

/** Existing Qist users explicitly connect Google only after signing in to their account. */
export default function GoogleConnectPage() {
  const { user } = useMe();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const busyRef = useRef(false);

  if (user.googleLinked) return <Navigate to="/" replace />;

  const connect = async (credential: string) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError('');
    try {
      await apiPost<{ connected: true }>('/me/google', { credential });
      queryClient.setQueryData<Me>(ME_KEY, (me) =>
        me ? { ...me, user: { ...me.user, googleLinked: true } } : me,
      );
      navigate('/', { replace: true });
    } catch (cause) {
      setError(getAxiosMessage(cause));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  return (
    <AuthCard
      title="Connect Google"
      subtitle="Connect your current Qist account so you can sign in with Google next time."
      footer={<Link to="/" className={authLinkClasses}>Back to dashboard</Link>}
    >
      <div className="space-y-4">
        <p className="text-sm text-body">
          Choose the Google account for <strong className="font-semibold">{user.email}</strong>.
          Your customers, contracts and shop settings will stay unchanged.
        </p>
        <GoogleSignInButton onCredential={connect} busy={busy} />
        {busy && <p role="status" className="text-sm text-muted">Connecting securely…</p>}
        {error && <Alert tone="danger">{error}</Alert>}
      </div>
    </AuthCard>
  );
}
