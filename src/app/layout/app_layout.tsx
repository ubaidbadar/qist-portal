import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ErrorBoundary } from '../../ui';
import PageSkeleton from '../../shared/page_skeleton';
import MobileNav from './mobile_nav';
import MobileTopBar from './mobile_top_bar';
import Sidebar from './sidebar';
import VerifyEmailBanner from './verify_email_banner';

export default function AppLayout() {
  const { pathname } = useLocation();

  return (
    <div className="flex min-h-dvh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        <MobileTopBar />
        <main className="flex-1">
          <VerifyEmailBanner />
          {/* Keyed by path so a crashed page recovers when the user navigates away. */}
          <ErrorBoundary key={pathname}>
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
