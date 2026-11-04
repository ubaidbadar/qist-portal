import { createStore } from './store';

export type Theme = 'light' | 'dark';
const STORAGE_KEY = 'shop_theme';

/** Prefer a calm light workspace until someone explicitly chooses otherwise. */
function loadTheme(): Theme {
  return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
}

const applyTheme = (theme: Theme) => document.documentElement.classList.toggle('dark', theme === 'dark');

export const themeStore = createStore(loadTheme());

export const initTheme = () => applyTheme(themeStore.get());

export function setTheme(theme: Theme) {
  localStorage.setItem(STORAGE_KEY, theme);
  applyTheme(theme);
  themeStore.set(theme);
}
