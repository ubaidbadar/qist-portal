import { Moon, Sun } from 'lucide-react';
import { IconButton } from '../../ui';
import useTheme from '../../hooks/useTheme';

/** Theme choice is explicit, remembered, and keyboard accessible. */
export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <IconButton
      icon={isDark ? Sun : Moon}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      onClick={toggleTheme}
    />
  );
}
