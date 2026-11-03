import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '../utils/store';
import FullPageLoader from '../shared/full_page_loader';
import { sessionStore } from './session';

/** Sign-in and sign-up: someone already signed in goes straight to the portal. */
export default function GuestOnly() {
  const { status } = useStore(sessionStore);
  if (status === 'loading') return <FullPageLoader />;
  if (status === 'signed_in') return <Navigate to="/" replace />;
  return <Outlet />;
}
