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

/** Every screen's frame: sticky header (breadcrumb, title, actions) above a centred content column. */
export default function Page({ title, breadcrumbs, actions, children }: PageProps) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="min-w-0">
            {breadcrumbs && <Breadcrumbs items={breadcrumbs} />}
            <h1 className="truncate text-xl font-semibold tracking-tight text-ink sm:text-2xl">{title}</h1>
          </div>
          {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">{children}</div>
    </>
  );
}

function Breadcrumbs({ items }: { items: Breadcrumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-1">
      <ol className="flex items-center gap-1 text-xs text-muted">
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
