import { useState } from 'react';

/** State that is owned by the parent when `value` is defined, and internally otherwise. */
export function useControllableState<T>(
  value: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void,
) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = value !== undefined;

  const setValue = (next: T) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  };

  return [isControlled ? value : internalValue, setValue] as const;
}
