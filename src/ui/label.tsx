import type { LabelHTMLAttributes, ReactNode } from 'react';

export interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  required?: boolean;
}

export default function Label({
  children,
  required = false,
  className = '',
  ...props
}: LabelProps) {
  return (
    <label
      className={`block text-sm font-medium text-body mb-1.5 ${className}`}
      {...props}
    >
      {children}
      {required && (
        <span className="text-danger-500 ml-1" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
