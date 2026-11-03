import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { APP_NAME } from '@shop/shared';
import Brand from '../../app/layout/brand';
import Logo from '../../app/layout/logo';
import { Skeleton } from '../../ui';
import AuthShowcase from './auth_showcase';

/** Sign-in, sign-up and password pages: the form beside a gradient panel on wide screens, alone on phones. */
export default function AuthLayout() {
  return (
    <div className="grid min-h-dvh gap-6 p-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:p-4">
      <main className="flex flex-col px-3 py-6 sm:px-8 lg:py-10">
        <div className="mb-10 hidden lg:mb-0 lg:block">
          <Brand />
        </div>
        {/* Phones: the gradient panel shrinks to a header. */}
        <div className="mb-8 rounded-panel bg-linear-to-br from-brand-start to-brand-end p-5 text-on-brand lg:hidden">
          <p className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-small bg-surface text-ink">
              <Logo className="size-6" />
            </span>
            {APP_NAME}
          </p>
          <p className="mt-3 text-xl leading-snug font-semibold">Sell phones on installments. Get paid on time.</p>
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col lg:justify-center">
          <Suspense fallback={<Skeleton className="h-96 w-full rounded-card" />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
      <AuthShowcase />
    </div>
  );
}
