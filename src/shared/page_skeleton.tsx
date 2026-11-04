import Logo from '../app/layout/logo';

/** The route is loading, before its page-specific data placeholders can render. */
export default function PageSkeleton() {
  return (
    <div className="grid min-h-64 place-items-center px-4 py-10" role="status" aria-label="Loading page">
      <Logo className="size-10 animate-pulse motion-reduce:animate-none" />
    </div>
  );
}
