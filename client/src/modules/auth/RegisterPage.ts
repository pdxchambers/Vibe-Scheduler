import { el } from '../../utils/dom';
import { authApi } from '../../api/auth.api';
import { ApiRequestError } from '../../api/client';
import { setUser } from '../../state/session';
import { applyTheme } from '../preferences/theme';
import { navigate } from '../../router/router';
import { showToast } from '../../components/Toast';

export function RegisterPage(container: HTMLElement) {
  const errorBox = el('div', { class: 'form-error', role: 'alert' });
  errorBox.style.display = 'none';

  const nameInput = el('input', {
    type: 'text',
    id: 'register-name',
    name: 'displayName',
    autocomplete: 'name',
    required: true,
  }) as HTMLInputElement;

  const emailInput = el('input', {
    type: 'email',
    id: 'register-email',
    name: 'email',
    autocomplete: 'email',
    required: true,
  }) as HTMLInputElement;

  const passwordInput = el('input', {
    type: 'password',
    id: 'register-password',
    name: 'password',
    autocomplete: 'new-password',
    minlength: '8',
    required: true,
  }) as HTMLInputElement;

  const hint = el('p', { class: 'form-hint' }, 'At least 8 characters.');

  const submitButton = el('button', { class: 'button button--primary', type: 'submit' }, 'Create account');

  function setLoading(loading: boolean) {
    submitButton.toggleAttribute('disabled', loading);
    submitButton.textContent = loading ? 'Creating account…' : 'Create account';
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
          const { user } = await authApi.register(emailInput.value, passwordInput.value, nameInput.value);
          applyTheme(user.preferences.theme);
          setUser(user);
          showToast(`Welcome, ${user.displayName}!`, 'success');
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
      el('div', { class: 'form-field' }, [el('label', { for: 'register-name' }, 'Name'), nameInput]),
      el('div', { class: 'form-field' }, [el('label', { for: 'register-email' }, 'Email'), emailInput]),
      el('div', { class: 'form-field' }, [
        el('label', { for: 'register-password' }, 'Password'),
        passwordInput,
        hint,
      ]),
      errorBox,
      submitButton,
    ]
  );

  container.appendChild(
    el('div', { class: 'auth-page' }, [
      el('div', { class: 'auth-card' }, [
        el('h1', {}, 'Create your account'),
        el('p', { class: 'auth-subtitle' }, 'Start scheduling in seconds.'),
        form,
        el('p', { class: 'auth-switch' }, ['Already have an account? ', el('a', { href: '#/login' }, 'Log in')]),
      ]),
    ])
  );

  nameInput.focus();
}
