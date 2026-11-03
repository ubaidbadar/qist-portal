/**
 * The Qist mark: a Q whose ring is teal, whose tail is amber, with a keyhole inside. The keyhole takes the text
 * color, so it stays visible on light and dark backgrounds.
 */
export default function Logo({ className = 'size-8' }: { className?: string }) {
  return (
    <svg viewBox="0 0 96 96" aria-hidden="true" className={`shrink-0 ${className}`}>
      <circle cx="46" cy="46" r="28" fill="none" strokeWidth="12" className="stroke-logo-ring" />
      <path d="M62 62 L78 78" fill="none" strokeWidth="12" strokeLinecap="round" className="stroke-logo-tail" />
      <circle cx="46" cy="41" r="6" className="fill-current" />
      <path d="M43 45 L49 45 L51 59 L41 59 Z" className="fill-current" />
    </svg>
  );
}
