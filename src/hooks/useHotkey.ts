import { useEffect, useEffectEvent } from 'react';

/** Calls `onPress` on Ctrl+key (Cmd+key on macOS), anywhere on the page. */
export default function useHotkey(key: string, onPress: () => void) {
  const press = useEffectEvent(onPress);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === key) {
        event.preventDefault();
        press();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [key]);
}
