import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { GoogleAuthResponse } from '@shop/shared';
import { Alert } from '../../ui';
import { signIn } from '../../auth';
import { apiPost } from '../../config/api';
import getAxiosMessage from '../../utils/get_axios_message';
import { clearPendingGoogleAuth, savePendingGoogleAuth } from './google_auth';
import GoogleSignInButton from './google_sign_in_button';

interface GoogleAuthSectionProps {
  redirectTo: string;
}

/** Shared Google sign-in/sign-up flow. New accounts continue to the short shop onboarding screen. */
export default function GoogleAuthSection({ redirectTo }: GoogleAuthSectionProps) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const handleCredential = async (credential: string) => {
    setBusy(true);
    setError('');
    try {
      const result = await apiPost<GoogleAuthResponse>('/auth/google', { credential }, { skipAuthRefresh: true });
      if ('onboardingRequired' in result) {
        const saved = savePendingGoogleAuth({ credential, profile: result.profile });
        if (!saved) throw new Error('Your browser could not keep the sign-in session. Please allow session storage and try again.');
        navigate('/onboarding', { replace: true });
        return;
      }

      clearPendingGoogleAuth();
      signIn(result);
      navigate(redirectTo, { replace: true });
    } catch (cause) {
      setError(getAxiosMessage(cause));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <GoogleSignInButton onCredential={handleCredential} busy={busy} />
      {busy && <p role="status" className="text-center text-sm text-muted">Signing you in securely…</p>}
      {error && <Alert tone="danger">{error}</Alert>}
    </div>
  );
}
