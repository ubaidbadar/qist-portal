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
    <div className="portal-shell flex min-h-dvh bg-canvas">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:start-3 focus:top-3 focus:z-50 focus:rounded-control focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
      >
        Skip to content
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-0">
        <MobileTopBar />
        <main id="main" tabIndex={-1} className="flex-1">
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
