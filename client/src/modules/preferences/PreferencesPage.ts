import { el } from '../../utils/dom';
import { sessionStore, setUser } from '../../state/session';
import { usersApi } from '../../api/users.api';
import { ApiRequestError } from '../../api/client';
import { applyTheme } from './theme';
import { showToast } from '../../components/Toast';
import { ThemePreference, TimeFormatPreference, WeekStartDay } from '../../api/types';

export function PreferencesPage(container: HTMLElement) {
  const { user } = sessionStore.getState();
  if (!user) return;

  const page = el('div', { class: 'page preferences-page' });
  container.appendChild(page);

  page.appendChild(el('h1', {}, 'Preferences'));

  // --- Profile section -------------------------------------------------
  const nameInput = el('input', {
    type: 'text',
    id: 'pref-display-name',
    value: user.displayName,
    required: true,
  }) as HTMLInputElement;

  const profileSaveButton = el('button', { class: 'button button--primary', type: 'submit' }, 'Save name');

  const profileForm = el(
    'form',
    {
      class: 'settings-form',
      onsubmit: async (e: Event) => {
        e.preventDefault();
        try {
          const updated = await usersApi.updateProfile(nameInput.value);
          setUser(updated);
          showToast('Profile updated', 'success');
        } catch (err) {
          showToast(err instanceof ApiRequestError ? err.message : 'Could not update profile', 'error');
        }
      },
    },
    [el('div', { class: 'form-field' }, [el('label', { for: 'pref-display-name' }, 'Display name'), nameInput]), profileSaveButton]
  );

  page.appendChild(
    el('section', { class: 'settings-section' }, [
      el('h2', {}, 'Profile'),
      el('p', { class: 'settings-section__meta' }, user.email),
      profileForm,
    ])
  );

  // --- Appearance section ------------------------------------------------
  async function handlePreferenceChange<T>(key: string, value: T) {
    try {
      const updated = await usersApi.updatePreferences({ [key]: value } as any);
      setUser(updated);
      if (key === 'theme') applyTheme(value as ThemePreference);
      showToast('Preferences saved', 'success');
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : 'Could not save preference', 'error');
    }
  }

  const themeOptions: { value: ThemePreference; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'system', label: 'Match system' },
  ];

  const themeSelect = el(
    'select',
    {
      id: 'pref-theme',
      onchange: (e: Event) => handlePreferenceChange('theme', (e.target as HTMLSelectElement).value),
    },
    themeOptions.map((opt) =>
      el('option', { value: opt.value, selected: opt.value === user.preferences.theme }, opt.label)
    )
  );

  const weekStartOptions: { value: WeekStartDay; label: string }[] = [
    { value: 'sunday', label: 'Sunday' },
    { value: 'monday', label: 'Monday' },
  ];

  const weekStartSelect = el(
    'select',
    {
      id: 'pref-week-start',
      onchange: (e: Event) => handlePreferenceChange('weekStartsOn', (e.target as HTMLSelectElement).value),
    },
    weekStartOptions.map((opt) =>
      el('option', { value: opt.value, selected: opt.value === user.preferences.weekStartsOn }, opt.label)
    )
  );

  const timeFormatOptions: { value: TimeFormatPreference; label: string }[] = [
    { value: '12h', label: '12-hour (2:00 PM)' },
    { value: '24h', label: '24-hour (14:00)' },
  ];

  const timeFormatSelect = el(
    'select',
    {
      id: 'pref-time-format',
      onchange: (e: Event) => handlePreferenceChange('timeFormat', (e.target as HTMLSelectElement).value),
    },
    timeFormatOptions.map((opt) =>
      el('option', { value: opt.value, selected: opt.value === user.preferences.timeFormat }, opt.label)
    )
  );

  const colorInput = el('input', {
    type: 'color',
    id: 'pref-default-color',
    value: user.preferences.defaultEventColor,
    onchange: (e: Event) => handlePreferenceChange('defaultEventColor', (e.target as HTMLInputElement).value),
  }) as HTMLInputElement;

  page.appendChild(
    el('section', { class: 'settings-section' }, [
      el('h2', {}, 'Appearance & scheduling'),
      el('div', { class: 'form-field' }, [el('label', { for: 'pref-theme' }, 'Theme'), themeSelect]),
      el('div', { class: 'form-field' }, [el('label', { for: 'pref-week-start' }, 'Week starts on'), weekStartSelect]),
      el('div', { class: 'form-field' }, [el('label', { for: 'pref-time-format' }, 'Time format'), timeFormatSelect]),
      el('div', { class: 'form-field' }, [
        el('label', { for: 'pref-default-color' }, 'Default event color'),
        colorInput,
      ]),
    ])
  );
}
