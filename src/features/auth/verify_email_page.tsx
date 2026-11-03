import { Link, useSearchParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert, Skeleton } from '../../ui';
import { apiPost } from '../../config/api';
import { ME_KEY } from '../../auth';
import getAxiosMessage from '../../utils/get_axios_message';
import AuthCard, { authLinkClasses } from './auth_card';

/** Opened from the emailed link. A query (not an effect) so the one-time link is sent once, even in Strict Mode. */
export default function VerifyEmailPage() {
  const token = useSearchParams()[0].get('token') ?? '';
  const queryClient = useQueryClient();
  const { isPending, error } = useQuery({
    queryKey: ['verify-email', token],
    queryFn: async () => {
      await apiPost('/auth/verify-email', { token }, { skipAuthRefresh: true });
      await queryClient.invalidateQueries({ queryKey: ME_KEY });
      return true;
    },
    enabled: Boolean(token),
    retry: false,
    staleTime: Infinity,
  });

  return (
    <AuthCard
      title="Email confirmation"
      footer={
        <Link to="/" className={authLinkClasses}>
          Continue
        </Link>
      }
    >
      {!token && <Alert tone="danger">This link is incomplete. Open the link from your email again.</Alert>}
      {token && isPending && <Skeleton className="h-12 w-full" />}
      {token && error && <Alert tone="danger">{getAxiosMessage(error)} Sign in and send a new link from the banner.</Alert>}
      {token && !isPending && !error && <Alert tone="success">Your email address is confirmed.</Alert>}
    </AuthCard>
  );
}
