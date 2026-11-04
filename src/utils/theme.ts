/** Qist has a single light theme. Clear any legacy dark preference on startup. */
export function initTheme() {
  document.documentElement.classList.remove('dark');
  localStorage.removeItem('shop_theme');
}
