import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import Label from './label';

/** Stable id + aria wiring shared by every form control. */
export function useFieldControl(id: string | undefined, error: string | undefined, required?: boolean) {
  const generatedId = useId();
  const controlId = id || generatedId;
  const errorId = `${controlId}-error`;

  return {
    errorId,
    controlProps: {
      id: controlId,
      'aria-invalid': Boolean(error),
      'aria-required': required || undefined,
      'aria-describedby': error ? errorId : undefined,
    },
  };
}

interface FieldErrorProps {
  id: string;
  children?: string;
  className?: string;
}

export function FieldError({ id, children, className = 'mt-1.5 text-sm' }: FieldErrorProps) {
  if (!children) return null;

  return (
    <p id={id} className={`${className} text-danger-600`} role="alert">
      {children}
    </p>
  );
}

interface FieldShellProps {
  controlId: string;
  errorId: string;
  label?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

/** Label above, error below: the layout of text-like controls (Input, Select, Textarea). */
export function FieldShell({ controlId, errorId, label, required, error, children }: FieldShellProps) {
  return (
    <div className="w-full">
      {label && (
        <Label htmlFor={controlId} required={required}>
          {label}
        </Label>
      )}
      {children}
      <FieldError id={errorId}>{error}</FieldError>
    </div>
  );
}

export interface ChoiceFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: ReactNode;
  error?: string;
}

interface ChoiceFieldBaseProps extends ChoiceFieldProps {
  type: 'checkbox' | 'radio';
  inputClassName: string;
  /** Drawn over the native control, e.g. a check icon. */
  indicator?: ReactNode;
}

/** Control left, label right: the layout shared by Checkbox and Radio. */
export function ChoiceField({
  type,
  inputClassName,
  indicator,
  className = '',
  label,
  error,
  id,
  ...props
}: ChoiceFieldBaseProps) {
  const { errorId, controlProps } = useFieldControl(id, error);

  return (
    <label htmlFor={controlProps.id} className={`flex items-start gap-3 cursor-pointer ${className}`}>
      <span className="relative flex items-center justify-center pt-0.5">
        <input type={type} {...controlProps} className={inputClassName} {...props} />
        {indicator}
      </span>
      {label && (
        <span className="flex flex-col">
          <span className="text-sm font-medium text-body leading-5 select-none">{label}</span>
          <FieldError id={errorId} className="mt-1 text-xs">
            {error}
          </FieldError>
        </span>
      )}
    </label>
  );
}
