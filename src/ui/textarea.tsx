import type { TextareaHTMLAttributes } from 'react';
import { formInputBaseClasses } from '../utils/styles';
import { FieldShell, useFieldControl } from './field';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  required?: boolean;
}

export default function Textarea({
  className = '',
  label,
  error,
  required,
  id,
  name,
  ...props
}: TextareaProps) {
  const { errorId, controlProps } = useFieldControl(id || name, error, required);

  return (
    <FieldShell controlId={controlProps.id} errorId={errorId} label={label} required={required} error={error}>
      <textarea
        {...controlProps}
        name={name}
        className={`${formInputBaseClasses} py-3 resize-y min-h-25 ${className}`}
        {...props}
      />
    </FieldShell>
  );
}
