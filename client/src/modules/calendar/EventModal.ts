import { el } from '../../utils/dom';
import { CalendarEvent, RecurrenceFrequency } from '../../api/types';
import { eventsApi } from '../../api/events.api';
import { ApiRequestError } from '../../api/client';
import { showToast } from '../../components/Toast';
import { toDateTimeLocalValue } from './calendar-utils';

export interface EventModalOptions {
  event?: CalendarEvent;
  defaultStart?: Date;
  defaultColor: string;
  onSaved: (event: CalendarEvent) => void;
  onDeleted: (eventId: string) => void;
}

const RECURRENCE_OPTIONS: { value: RecurrenceFrequency; label: string }[] = [
  { value: 'none', label: 'Does not repeat' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export function openEventModal(options: EventModalOptions): void {
  const { event, onSaved, onDeleted } = options;
  const isEditing = Boolean(event);

  const now = options.defaultStart ?? new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);

  const startTime = event ? new Date(event.startTime) : now;
  const endTime = event ? new Date(event.endTime) : oneHourLater;

  function close() {
    document.removeEventListener('keydown', onKeydown);
    backdrop.remove();
  }

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') close();
  }

  const titleInput = el('input', {
    type: 'text',
    id: 'event-title',
    required: true,
    value: event?.title ?? '',
    placeholder: 'Add a title',
  }) as HTMLInputElement;

  const startInput = el('input', {
    type: 'datetime-local',
    id: 'event-start',
    required: true,
    value: toDateTimeLocalValue(startTime),
  }) as HTMLInputElement;

  const endInput = el('input', {
    type: 'datetime-local',
    id: 'event-end',
    required: true,
    value: toDateTimeLocalValue(endTime),
  }) as HTMLInputElement;

  const allDayInput = el('input', {
    type: 'checkbox',
    id: 'event-all-day',
    checked: event?.allDay ?? false,
  }) as HTMLInputElement;

  const locationInput = el('input', {
    type: 'text',
    id: 'event-location',
    value: event?.location ?? '',
    placeholder: 'Add a location',
  }) as HTMLInputElement;

  const descriptionInput = el('textarea', {
    id: 'event-description',
    rows: '3',
    placeholder: 'Add a description',
  }) as HTMLTextAreaElement;
  descriptionInput.value = event?.description ?? '';

  const colorInput = el('input', {
    type: 'color',
    id: 'event-color',
    value: event?.color ?? options.defaultColor,
  }) as HTMLInputElement;

  const recurrenceSelect = el(
    'select',
    { id: 'event-recurrence' },
    RECURRENCE_OPTIONS.map((opt) =>
      el('option', { value: opt.value, selected: opt.value === (event?.recurrence ?? 'none') }, opt.label)
    )
  ) as HTMLSelectElement;

  const errorBox = el('div', { class: 'form-error', role: 'alert' });
  errorBox.style.display = 'none';

  const saveButton = el('button', { class: 'button button--primary', type: 'submit' }, isEditing ? 'Save changes' : 'Create event');

  const deleteButton = isEditing
    ? el(
        'button',
        {
          class: 'button button--danger',
          type: 'button',
          onclick: async () => {
            if (!event) return;
            if (!window.confirm('Delete this event? This cannot be undone.')) return;
            try {
              await eventsApi.remove(event.id);
              onDeleted(event.id);
              showToast('Event deleted', 'success');
              close();
            } catch (err) {
              showToast(err instanceof ApiRequestError ? err.message : 'Could not delete event', 'error');
            }
          },
        },
        'Delete'
      )
    : null;

  const form = el(
    'form',
    {
      class: 'event-form',
      onsubmit: async (e: Event) => {
        e.preventDefault();
        errorBox.style.display = 'none';

        const input = {
          title: titleInput.value,
          description: descriptionInput.value,
          location: locationInput.value,
          startTime: new Date(startInput.value).toISOString(),
          endTime: new Date(endInput.value).toISOString(),
          allDay: allDayInput.checked,
          color: colorInput.value,
          recurrence: recurrenceSelect.value as RecurrenceFrequency,
        };

        saveButton.toggleAttribute('disabled', true);
        try {
          const saved = event ? await eventsApi.update(event.id, input) : await eventsApi.create(input);
          onSaved(saved);
          showToast(isEditing ? 'Event updated' : 'Event created', 'success');
          close();
        } catch (err) {
          errorBox.textContent = err instanceof ApiRequestError ? err.message : 'Could not save event';
          errorBox.style.display = 'block';
        } finally {
          saveButton.toggleAttribute('disabled', false);
        }
      },
    },
    [
      el('div', { class: 'form-field' }, [el('label', { for: 'event-title' }, 'Title'), titleInput]),
      el('div', { class: 'form-row' }, [
        el('div', { class: 'form-field' }, [el('label', { for: 'event-start' }, 'Starts'), startInput]),
        el('div', { class: 'form-field' }, [el('label', { for: 'event-end' }, 'Ends'), endInput]),
      ]),
      el('div', { class: 'form-field form-field--inline' }, [
        allDayInput,
        el('label', { for: 'event-all-day' }, 'All day'),
      ]),
      el('div', { class: 'form-field' }, [el('label', { for: 'event-location' }, 'Location'), locationInput]),
      el('div', { class: 'form-field' }, [el('label', { for: 'event-description' }, 'Description'), descriptionInput]),
      el('div', { class: 'form-row' }, [
        el('div', { class: 'form-field' }, [el('label', { for: 'event-color' }, 'Color'), colorInput]),
        el('div', { class: 'form-field' }, [el('label', { for: 'event-recurrence' }, 'Repeats'), recurrenceSelect]),
      ]),
      errorBox,
      el('div', { class: 'event-form__actions' }, [deleteButton, saveButton].filter(Boolean) as Node[]),
    ]
  );

  const modal = el('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true', 'aria-label': isEditing ? 'Edit event' : 'New event' }, [
    el('div', { class: 'modal__header' }, [
      el('h2', {}, isEditing ? 'Edit event' : 'New event'),
      el(
        'button',
        { class: 'icon-button', type: 'button', 'aria-label': 'Close', onclick: () => close() },
        '✕'
      ),
    ]),
    form,
  ]);

  const backdrop = el('div', {
    class: 'modal-backdrop',
    onclick: (e: Event) => {
      if (e.target === backdrop) close();
    },
  });
  backdrop.appendChild(modal);

  document.body.appendChild(backdrop);
  document.addEventListener('keydown', onKeydown);
  titleInput.focus();
}
