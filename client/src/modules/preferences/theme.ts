import { ThemePreference } from '../../api/types';

const STORAGE_KEY = 'calendar-app:theme';
let mediaQuery: MediaQueryList | null = null;
let mediaListenerAttached = false;

function resolveSystemTheme(): 'light' | 'dark' {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/** Applies the resolved theme to <html data-theme="..."> and persists the raw preference locally for a flash-free reload. */
export function applyTheme(preference: ThemePreference): void {
  const resolved = preference === 'system' ? resolveSystemTheme() : preference;
  document.documentElement.setAttribute('data-theme', resolved);
  try {
    window.localStorage.setItem(STORAGE_KEY, preference);
  } catch {
    // localStorage may be unavailable (private browsing, etc.) - non-fatal
  }

  if (preference === 'system' && !mediaListenerAttached) {
    mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => applyTheme('system'));
    mediaListenerAttached = true;
  }
}

/** Reads a locally-cached theme preference so the correct theme can be applied before the user's profile loads. */
export function getCachedThemePreference(): ThemePreference {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  } catch {
    // ignore
  }
  return 'system';
}
