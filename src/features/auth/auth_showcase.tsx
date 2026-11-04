import { BarChart3, CheckCircle2, LockKeyhole, type LucideIcon } from 'lucide-react';
import { APP_NAME } from '@shop/shared';
import Logo from '../../app/layout/logo';

const FEATURES: { icon: LucideIcon; text: string }[] = [
  { icon: BarChart3, text: 'Track every installment plan' },
  { icon: LockKeyhole, text: 'Lock overdue phones remotely' },
  { icon: CheckCircle2, text: 'Record payments in seconds' },
];

/** One shared brand story for sign-in, sign-up, recovery and password changes. */
export default function AuthShowcase() {
  return (
    <aside className="hidden min-h-dvh flex-col bg-brand-navy px-8 py-12 text-on-brand lg:flex xl:px-14 xl:py-14">
      <div className="flex items-center gap-3 text-xl font-bold tracking-tight">
        <Logo className="size-12" />
        {APP_NAME}
      </div>
      <div className="my-auto max-w-xl py-16">
        <h2 className="text-4xl leading-tight font-bold tracking-tight text-on-brand xl:text-5xl">
          Sell on installments.<br />Stay in control.
        </h2>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-brand-muted">
          Track every plan, record payments and lock overdue phones from one place.
        </p>
      </div>
      <ul className="space-y-5">
        {FEATURES.map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-4 text-sm font-medium text-on-brand">
            <span className="grid size-12 shrink-0 place-items-center rounded-pill bg-brand-raised text-brand-muted">
              <Icon size={20} aria-hidden="true" />
            </span>
            {text}
          </li>
        ))}
      </ul>
    </aside>
  );
}
