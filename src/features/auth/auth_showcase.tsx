import { CalendarCheck, Lock, Store, type LucideIcon } from 'lucide-react';
import Logo from '../../app/layout/logo';
import { APP_NAME } from '@shop/shared';

const FEATURES: { icon: LucideIcon; text: string }[] = [
  { icon: Store, text: 'Every branch in one place: customers, stock and sales' },
  { icon: CalendarCheck, text: 'Installment schedules that add up to the last paisa' },
  { icon: Lock, text: 'Phones lock when payments stop, and unlock when they resume' },
];

const SAMPLE = [
  { name: 'Muhammad Usman', amount: 'Rs 10,800', status: 'Paid', tone: 'bg-on-brand/25' },
  { name: 'Zainab Bibi', amount: 'Rs 7,250', status: 'Due today', tone: 'bg-on-brand/15' },
  { name: 'Bilal Ahmed', amount: 'Rs 12,400', status: '3 days late', tone: 'bg-on-brand/10' },
];

/** The sign-in pages' gradient panel: what the product does, and a glimpse of it. Decorative on the whole. */
export default function AuthShowcase() {
  return (
    <aside className="relative hidden overflow-hidden rounded-panel bg-linear-to-br from-brand-start to-brand-end p-10 text-on-brand lg:flex lg:flex-col">
      <div aria-hidden="true" className="absolute -top-24 -right-24 size-80 rounded-full bg-on-brand/10 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-32 -left-16 size-96 rounded-full bg-on-brand/10 blur-3xl" />

      <p className="relative flex items-center gap-2.5 text-lg font-semibold">
        <span className="flex size-10 items-center justify-center rounded-control bg-surface text-ink shadow-card">
          <Logo className="size-7" />
        </span>
        {APP_NAME}
      </p>

      <div className="relative mt-auto space-y-8">
        <h2 className="max-w-md text-4xl leading-tight font-semibold tracking-tight">Sell phones on installments. Get paid on time.</h2>
        <ul className="space-y-3">
          {FEATURES.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-on-brand/90">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-on-brand/15">
                <Icon size={16} aria-hidden="true" />
              </span>
              {text}
            </li>
          ))}
        </ul>

        <div aria-hidden="true" className="max-w-sm rounded-card bg-on-brand/10 p-4 ring-1 ring-on-brand/20 backdrop-blur-sm">
          <p className="mb-3 text-xs font-medium tracking-wide uppercase opacity-80">Today's collections</p>
          <ul className="space-y-2 text-sm">
            {SAMPLE.map((row) => (
              <li key={row.name} className="flex items-center gap-3">
                <span className="flex-1 truncate">{row.name}</span>
                <span className="tabular-nums opacity-90">{row.amount}</span>
                <span className={`rounded-pill px-2 py-0.5 text-xs ${row.tone}`}>{row.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
