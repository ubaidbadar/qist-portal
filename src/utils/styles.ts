/**
 * Shared utility classes for the design system.
 * Extracting these prevents duplication and ensures consistent
 * focus states and borders across all form elements.
 */

// Text-like controls show focus as an accent border + hairline ring instead of the global outline.
// `error:` (see index.css) covers both the `error` prop (aria-invalid) and native :user-invalid.
export const formInputBaseClasses =
  'w-full rounded-control border border-border bg-surface px-4 text-ink placeholder:text-subtle transition-colors outline-hidden focus:border-accent focus:ring-1 focus:ring-accent error:border-danger-300 error:focus:border-danger-500 error:focus:ring-danger-500';
