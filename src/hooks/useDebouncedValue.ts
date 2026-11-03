import { useEffect, useState } from 'react';

const DEFAULT_DELAY_MS = 300;

/** `value`, updated only after it has stopped changing for `delayMs`: one search request per pause in typing. */
export default function useDebouncedValue<T>(value: T, delayMs = DEFAULT_DELAY_MS) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
