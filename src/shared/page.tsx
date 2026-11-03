import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface Breadcrumb {
  label: string;
  to?: string;
}

interface PageProps {
  title: string;
  breadcrumbs?: Breadcrumb[];
  /** The page's primary action(s), shown at the right of the header. */
  actions?: ReactNode;
  children: ReactNode;
}

/** Every screen's frame: title and actions above a shared content column. */
export default function Page({ title, breadcrumbs, actions, children }: PageProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-8 pt-5 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
        <div className="min-w-0">
          {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">{title}</h1>
        </div>
        {actions && <div className="flex min-w-0 flex-wrap items-center gap-2">{actions}</div>}
      </header>
      {children}
    </div>
  );
}

function Breadcrumbs({ items }: { items: Breadcrumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-2">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-muted">
        {items.map((item, index) => (
          <li key={item.label} className="flex items-center gap-1">
            {index > 0 && <ChevronRight size={12} aria-hidden="true" />}
            {item.to ? (
              <Link to={item.to} className="rounded-chip transition-colors duration-150 hover:text-ink">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
