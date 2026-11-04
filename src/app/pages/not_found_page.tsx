import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Brand from '../layout/brand';
import { Button } from '../../ui';

export default function NotFoundPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-canvas px-5 py-10">
      <section className="w-full max-w-md rounded-panel bg-surface p-6 shadow-card sm:p-8">
        <Brand />
        <Compass className="mt-8 size-7 text-accent" aria-hidden="true" />
        <h1 className="mt-3 text-2xl font-semibold text-ink">Page not found</h1>
        <p className="mt-2 text-sm text-muted">Check the address or return to the Qist portal.</p>
        <Button as={Link} to="/" className="mt-6">Go to Qist</Button>
      </section>
    </main>
  );
}
