import { useId } from 'react';

/** Qist's canonical cyan-to-blue keyhole, shared by every branded surface. */
export default function Logo({ className = 'size-8' }: { className?: string }) {
  const id = useId().replace(/:/g, '');

  return (
    <svg viewBox="6 44 112 112" aria-hidden="true" focusable="false" className={`shrink-0 ${className}`}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-brand-gradient-start)" />
          <stop offset="100%" stopColor="var(--color-brand-gradient-end)" />
        </linearGradient>
      </defs>
      <circle cx="62" cy="100" r="56" fill={`url(#${id})`} />
      <circle cx="62" cy="91" r="15" fill="var(--color-logo-keyhole)" />
      <path d="M57 101H67L69 118H55Z" fill="var(--color-logo-keyhole)" stroke="var(--color-logo-keyhole)" strokeWidth="6" strokeLinejoin="round" />
    </svg>
  );
}
