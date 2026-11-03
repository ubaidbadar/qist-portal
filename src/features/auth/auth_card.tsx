import type { ReactNode } from 'react';

interface AuthCardProps {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}

/** Keep the auth form on the canvas, like the Qist banking-style references. */
export default function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <>
      <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 leading-relaxed text-muted">{subtitle}</p>}
      <div className="mt-7">{children}</div>
      {footer && <p className="mt-5 text-center text-sm text-muted">{footer}</p>}
    </>
  );
}

export const authLinkClasses = 'rounded-chip font-semibold text-accent hover:underline';
