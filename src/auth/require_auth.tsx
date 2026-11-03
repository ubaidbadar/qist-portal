import { useQuery } from '@tanstack/react-query';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useStore } from '../utils/store';
import FullPageLoader from '../shared/full_page_loader';
import { MeContext, meQuery } from './me';
import { sessionStore } from './session';

export const CHANGE_PASSWORD_PATH = '/change-password';

/** Signed-in screens. Sends guests to sign-in, and users with a temporary password to change it first. */
export default function RequireAuth() {
  const { status } = useStore(sessionStore);
  const { data: me } = useQuery({ ...meQuery, enabled: status === 'signed_in' });
  const location = useLocation();

  if (status === 'loading' || (status === 'signed_in' && !me)) return <FullPageLoader />;
  if (!me) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (me.user.mustChangePassword && location.pathname !== CHANGE_PASSWORD_PATH) {
    return <Navigate to={CHANGE_PASSWORD_PATH} replace />;
  }

  return (
    <MeContext value={me}>
      <Outlet />
    </MeContext>
  );
}
