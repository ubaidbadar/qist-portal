import { createStore } from './store';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'shop_theme';

function loadTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

const applyTheme = (theme: Theme) => document.documentElement.classList.toggle('dark', theme === 'dark');

/** The active color theme; the `dark` class on <html> switches the tokens in index.css. */
export const themeStore = createStore(loadTheme());

/** Applies the stored (or system) theme before the first render. */
export const initTheme = () => applyTheme(themeStore.get());

export function setTheme(theme: Theme) {
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
  themeStore.set(theme);
}
