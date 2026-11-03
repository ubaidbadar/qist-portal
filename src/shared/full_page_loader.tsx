import Logo from '../app/layout/logo';

/** While the session is being restored on page load. */
export default function FullPageLoader() {
  return (
    <div className="flex min-h-dvh items-center justify-center" role="status" aria-label="Loading">
      <Logo className="size-12 animate-pulse motion-reduce:animate-none" />
    </div>
  );
}
