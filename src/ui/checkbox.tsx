import { Check } from 'lucide-react';
import { ChoiceField, type ChoiceFieldProps } from './field';

export type CheckboxProps = ChoiceFieldProps;

export default function Checkbox(props: CheckboxProps) {
  return (
    <ChoiceField
      type="checkbox"
      inputClassName="peer size-5 appearance-none rounded-chip border border-border bg-surface checked:border-accent checked:bg-accent transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      indicator={
        <Check
          size={14}
          aria-hidden="true"
          className="absolute text-surface pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
        />
      }
      {...props}
    />
  );
}
