import { ChoiceField, type ChoiceFieldProps } from './field';

export interface RadioProps extends ChoiceFieldProps {
  label?: string;
}

// The dot is the input's own background, clipped to its content box by the padding: no overlay element needed.
export default function Radio(props: RadioProps) {
  return (
    <ChoiceField
      type="radio"
      inputClassName="size-5 appearance-none rounded-full border border-border bg-surface bg-clip-content p-1 checked:border-accent checked:bg-accent transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      {...props}
    />
  );
}
