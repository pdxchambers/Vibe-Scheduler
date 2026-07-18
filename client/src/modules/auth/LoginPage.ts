import { el } from '../../utils/dom';
import { authApi } from '../../api/auth.api';
import { ApiRequestError } from '../../api/client';
import { setUser } from '../../state/session';
import { applyTheme } from '../preferences/theme';
import { navigate } from '../../router/router';
import { showToast } from '../../components/Toast';

export function LoginPage(container: HTMLElement) {
  const errorBox = el('div', { class: 'form-error', role: 'alert' });
  errorBox.style.display = 'none';

  const emailInput = el('input', {
    type: 'email',
    id: 'login-email',
    name: 'email',
    autocomplete: 'email',
    required: true,
  }) as HTMLInputElement;

  const passwordInput = el('input', {
    type: 'password',
    id: 'login-password',
    name: 'password',
    autocomplete: 'current-password',
    required: true,
  }) as HTMLInputElement;

  const submitButton = el('button', { class: 'button button--primary', type: 'submit' }, 'Log in');

  function setLoading(loading: boolean) {
    submitButton.toggleAttribute('disabled', loading);
    submitButton.textContent = loading ? 'Logging in…' : 'Log in';
  }

  const form = el(
    'form',
    {
      class: 'auth-form',
      onsubmit: async (e: Event) => {
        e.preventDefault();
        errorBox.style.display = 'none';
        setLoading(true);
        try {
          const { user } = await authApi.login(emailInput.value, passwordInput.value);
          applyTheme(user.preferences.theme);
          setUser(user);
          showToast(`Welcome back, ${user.displayName}!`, 'success');
          navigate('/calendar');
        } catch (err) {
          const message = err instanceof ApiRequestError ? err.message : 'Something went wrong. Please try again.';
          errorBox.textContent = message;
          errorBox.style.display = 'block';
        } finally {
          setLoading(false);
        }
      },
    },
    [
      el('div', { class: 'form-field' }, [el('label', { for: 'login-email' }, 'Email'), emailInput]),
      el('div', { class: 'form-field' }, [el('label', { for: 'login-password' }, 'Password'), passwordInput]),
      errorBox,
      submitButton,
    ]
  );

  container.appendChild(
    el('div', { class: 'auth-page' }, [
      el('div', { class: 'auth-card' }, [
        el('h1', {}, 'Welcome back'),
        el('p', { class: 'auth-subtitle' }, 'Log in to see your calendar.'),
        form,
        el('p', { class: 'auth-switch' }, [
          "Don't have an account? ",
          el('a', { href: '#/register' }, 'Create one'),
        ]),
      ]),
    ])
  );

  emailInput.focus();
}
