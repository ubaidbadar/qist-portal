import type { ReactNode } from 'react';
import { Card } from '../../ui';

interface AuthCardProps {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  /** Below the card, e.g. "New here? Create an account". */
  footer?: ReactNode;
}

export default function AuthCard({ title, subtitle, children, footer }: AuthCardProps) {
  return (
    <>
      <h1 className="text-3xl font-semibold tracking-tight text-ink">{title}</h1>
      {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
      <Card padding="lg" className="mt-8">
        {children}
      </Card>
      {footer && <p className="mt-6 text-center text-sm text-muted">{footer}</p>}
    </>
  );
}

/** A text link styled for the auth pages. */
export const authLinkClasses = 'font-medium text-accent rounded-chip hover:underline';
