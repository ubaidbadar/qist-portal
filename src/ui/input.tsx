import type { InputHTMLAttributes, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { formInputBaseClasses } from '../utils/styles';
import { FieldShell, useFieldControl } from './field';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: LucideIcon;
  rightElement?: ReactNode;
  error?: string;
  label?: string;
  required?: boolean;
}

export default function Input({
  className = '',
  icon: Icon,
  rightElement,
  error,
  label,
  required,
  id,
  name,
  ...props
}: InputProps) {
  const { errorId, controlProps } = useFieldControl(id || name, error, required);

  return (
    <FieldShell controlId={controlProps.id} errorId={errorId} label={label} required={required} error={error}>
      <span className="relative block">
        {Icon && (
          <Icon
            size={18}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 start-3 -translate-y-1/2 text-muted"
          />
        )}
        <input
          {...controlProps}
          name={name}
          className={`${formInputBaseClasses} py-2.5 ${Icon ? 'ps-10' : ''} ${rightElement ? 'pe-12' : ''} ${className}`}
          {...props}
        />
        {rightElement && <span className="absolute inset-y-0 end-1 flex items-center">{rightElement}</span>}
      </span>
    </FieldShell>
  );
}
