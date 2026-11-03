import { Loader2 } from 'lucide-react';

/** While the session is being restored on page load. */
export default function FullPageLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center" role="status" aria-label="Loading">
      <Loader2 size={28} className="animate-spin text-muted motion-reduce:animate-none" aria-hidden="true" />
    </div>
  );
}
