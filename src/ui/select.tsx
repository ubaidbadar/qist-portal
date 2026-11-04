import type { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { formInputBaseClasses } from '../utils/styles';
import { FieldShell, useFieldControl } from './field';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  label?: string;
  error?: string;
  placeholder?: string;
  required?: boolean;
}

export default function Select({
  className = '',
  label,
  error,
  options,
  placeholder,
  required,
  id,
  name,
  ...props
}: SelectProps) {
  const { errorId, controlProps } = useFieldControl(id || name, error, required);

  return (
    <FieldShell controlId={controlProps.id} errorId={errorId} label={label} required={required} error={error}>
      <div className="relative">
        <select
          {...controlProps}
          name={name}
          className={`${formInputBaseClasses} py-2.5 pr-10 appearance-none cursor-pointer ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-subtle">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted"
        />
      </div>
    </FieldShell>
  );
}
