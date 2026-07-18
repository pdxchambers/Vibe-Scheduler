import './styles/main.less';
import { el } from './utils/dom';
import { Navbar } from './components/Navbar';
import { createRouter } from './router/router';
import { LoginPage } from './modules/auth/LoginPage';
import { RegisterPage } from './modules/auth/RegisterPage';
import { CalendarPage } from './modules/calendar/CalendarPage';
import { PreferencesPage } from './modules/preferences/PreferencesPage';
import { applyTheme, getCachedThemePreference } from './modules/preferences/theme';
import { setUser } from './state/session';
import { usersApi } from './api/users.api';

// Apply a cached theme immediately so there's no light/dark flash before the
// user's profile has loaded from the server.
applyTheme(getCachedThemePreference());

const appRoot = document.getElementById('app')!;
const navbar = Navbar();
const outlet = el('main', { class: 'route-outlet' });

appRoot.appendChild(navbar);
appRoot.appendChild(outlet);

createRouter(
  [
    { path: '/login', render: LoginPage, guestOnly: true },
    { path: '/register', render: RegisterPage, guestOnly: true },
    { path: '/calendar', render: CalendarPage, requiresAuth: true },
    { path: '/preferences', render: PreferencesPage, requiresAuth: true },
    {
      path: '*',
      render: (c) => {
        c.appendChild(el('div', { class: 'not-found' }, 'Page not found.'));
      },
    },
  ],
  outlet,
  '/calendar'
);

// Resolve the current session on load (cookie-based auth, so no token to
// read from storage - just ask the server who we are).
usersApi
  .getMe()
  .then((user) => {
    applyTheme(user.preferences.theme);
    setUser(user);
  })
  .catch(() => {
    setUser(null);
  });
