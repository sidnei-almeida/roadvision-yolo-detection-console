const STORAGE_KEY = 'theme';
const DEFAULT_THEME = 'dark';

export function getTheme() {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME;
}

export function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem(STORAGE_KEY, theme);
}

export function initTheme() {
  setTheme(getTheme());
}

export function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}
