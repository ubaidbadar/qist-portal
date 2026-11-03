import { setTheme, themeStore } from '../utils/theme';
import { useStore } from '../utils/store';

export default function useTheme() {
  const theme = useStore(themeStore);
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return { theme, setTheme, toggleTheme };
}
