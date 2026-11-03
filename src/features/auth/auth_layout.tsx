import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Brand from '../../app/layout/brand';
import { Skeleton } from '../../ui';
import AuthShowcase from './auth_showcase';

/** Branded navy introduction beside a quiet, distraction-free form workspace. */
export default function AuthLayout() {
  return (
    <div className="grid min-h-dvh bg-canvas lg:grid-cols-[minmax(320px,41%)_minmax(0,1fr)]">
      <AuthShowcase />
      <main className="flex min-w-0 flex-col px-5 py-8 sm:px-10 lg:px-14">
        <div className="lg:hidden">
          <Brand />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <Suspense fallback={<Skeleton className="h-96 w-full rounded-card" />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
