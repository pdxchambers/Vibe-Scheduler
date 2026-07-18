import { el } from '../utils/dom';
import { sessionStore, setUser } from '../state/session';
import { navigate } from '../router/router';
import { authApi } from '../api/auth.api';
import { usersApi } from '../api/users.api';
import { applyTheme } from '../modules/preferences/theme';
import { showToast } from './Toast';

export function Navbar(): HTMLElement {
  const nav = el('nav', { class: 'navbar' });

  function render() {
    const { user, status } = sessionStore.getState();
    nav.replaceChildren();

    const brand = el('a', { class: 'navbar__brand', href: '#/calendar' }, [
      el('span', { class: 'navbar__brand-icon' }, '🗓️'),
      el('span', {}, 'Calendar'),
    ]);
    nav.appendChild(brand);

    if (status !== 'authenticated' || !user) {
      nav.appendChild(el('div', { class: 'navbar__links' }));
      return;
    }

    const isDark = user.preferences.theme === 'dark';

    const themeToggle = el(
      'button',
      {
        class: 'icon-button',
        type: 'button',
        title: 'Toggle dark mode',
        'aria-label': 'Toggle dark mode',
        onclick: async () => {
          const nextTheme = isDark ? 'light' : 'dark';
          applyTheme(nextTheme);
          try {
            const updated = await usersApi.updatePreferences({ theme: nextTheme });
            setUser(updated);
          } catch {
            showToast('Could not save theme preference', 'error');
          }
        },
      },
      isDark ? '☀️' : '🌙'
    );

    const links = el('div', { class: 'navbar__links' }, [
      el('a', { class: 'navbar__link', href: '#/calendar' }, 'Calendar'),
      el('a', { class: 'navbar__link', href: '#/preferences' }, 'Preferences'),
      themeToggle,
      el('span', { class: 'navbar__user' }, user.displayName),
      el(
        'button',
        {
          class: 'button button--ghost',
          type: 'button',
          onclick: async () => {
            try {
              await authApi.logout();
            } finally {
              setUser(null);
              navigate('/login');
            }
          },
        },
        'Log out'
      ),
    ]);
    nav.appendChild(links);
  }

  sessionStore.subscribe(render);
  render();

  return nav;
}
