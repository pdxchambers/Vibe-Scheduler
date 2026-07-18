import { el, clearElement } from '../../utils/dom';
import { sessionStore } from '../../state/session';
import { eventsApi } from '../../api/events.api';
import { CalendarEvent } from '../../api/types';
import { ApiRequestError } from '../../api/client';
import { showToast } from '../../components/Toast';
import { openEventModal } from './EventModal';
import { formatMonthYear, formatTime, getMonthGrid, getWeekdayLabels } from './calendar-utils';

export function CalendarPage(container: HTMLElement) {
  const { user } = sessionStore.getState();
  if (!user) return;

  let viewDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  let events: CalendarEvent[] = [];
  let isLoading = true;

  const page = el('div', { class: 'page calendar-page' });
  const header = el('div', { class: 'calendar-header' });
  const grid = el('div', { class: 'calendar-grid' });
  page.appendChild(header);
  page.appendChild(grid);
  container.appendChild(page);

  async function loadEvents() {
    isLoading = true;
    renderGrid();

    // Fetch a little padding beyond the visible grid so days from adjacent
    // months that appear in the grid still show their events.
    const gridDays = getMonthGrid(viewDate.getFullYear(), viewDate.getMonth(), user!.preferences.weekStartsOn);
    const from = gridDays[0].date;
    const to = gridDays[gridDays.length - 1].date;

    try {
      events = await eventsApi.list({ from: from.toISOString(), to: to.toISOString() });
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : 'Could not load events', 'error');
      events = [];
    } finally {
      isLoading = false;
      renderGrid();
    }
  }

  function eventsOnDay(date: Date): CalendarEvent[] {
    return events
      .filter((event) => {
        const start = new Date(event.startTime);
        const end = new Date(event.endTime);
        const dayStart = new Date(date);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date);
        dayEnd.setHours(23, 59, 59, 999);
        return start <= dayEnd && end >= dayStart;
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }

  function handleSaved(saved: CalendarEvent) {
    events = [...events.filter((ev) => ev.id !== saved.id), saved];
    renderGrid();
  }

  function handleDeleted(id: string) {
    events = events.filter((ev) => ev.id !== id);
    renderGrid();
  }

  function renderHeader() {
    clearElement(header);
    header.appendChild(
      el('div', { class: 'calendar-header__nav' }, [
        el(
          'button',
          {
            class: 'button button--ghost',
            type: 'button',
            onclick: () => {
              viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
              loadEvents();
              renderHeader();
            },
          },
          '‹'
        ),
        el('h1', { class: 'calendar-header__title' }, formatMonthYear(viewDate)),
        el(
          'button',
          {
            class: 'button button--ghost',
            type: 'button',
            onclick: () => {
              viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
              loadEvents();
              renderHeader();
            },
          },
          '›'
        ),
        el(
          'button',
          {
            class: 'button button--secondary',
            type: 'button',
            onclick: () => {
              viewDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
              loadEvents();
              renderHeader();
            },
          },
          'Today'
        ),
      ])
    );

    header.appendChild(
      el(
        'button',
        {
          class: 'button button--primary',
          type: 'button',
          onclick: () => {
            openEventModal({
              defaultStart: new Date(),
              defaultColor: user!.preferences.defaultEventColor,
              onSaved: handleSaved,
              onDeleted: handleDeleted,
            });
          },
        },
        '+ New event'
      )
    );
  }

  function renderGrid() {
    clearElement(grid);

    const weekdayLabels = getWeekdayLabels(user!.preferences.weekStartsOn);
    const weekdayRow = el(
      'div',
      { class: 'calendar-grid__weekdays' },
      weekdayLabels.map((label) => el('div', { class: 'calendar-grid__weekday' }, label))
    );
    grid.appendChild(weekdayRow);

    const days = getMonthGrid(viewDate.getFullYear(), viewDate.getMonth(), user!.preferences.weekStartsOn);
    const daysGrid = el('div', { class: 'calendar-grid__days' });

    for (const day of days) {
      const dayEvents = eventsOnDay(day.date);
      const cell = el(
        'div',
        {
          class: [
            'calendar-day',
            !day.inCurrentMonth && 'calendar-day--muted',
            day.isToday && 'calendar-day--today',
          ]
            .filter(Boolean)
            .join(' '),
          onclick: (e: Event) => {
            if ((e.target as HTMLElement).closest('.event-chip')) return;
            openEventModal({
              defaultStart: day.date,
              defaultColor: user!.preferences.defaultEventColor,
              onSaved: handleSaved,
              onDeleted: handleDeleted,
            });
          },
        },
        [
          el('div', { class: 'calendar-day__number' }, String(day.date.getDate())),
          el(
            'div',
            { class: 'calendar-day__events' },
            dayEvents.slice(0, 4).map((event) =>
              el(
                'button',
                {
                  class: 'event-chip',
                  type: 'button',
                  style: `--event-color: ${event.color}`,
                  title: event.title,
                  onclick: () => {
                    openEventModal({
                      event,
                      defaultColor: user!.preferences.defaultEventColor,
                      onSaved: handleSaved,
                      onDeleted: handleDeleted,
                    });
                  },
                },
                [
                  !event.allDay
                    ? el('span', { class: 'event-chip__time' }, formatTime(event.startTime, user!.preferences.timeFormat))
                    : null,
                  el('span', { class: 'event-chip__title' }, event.title),
                ]
              )
            )
          ),
          dayEvents.length > 4 ? el('div', { class: 'calendar-day__more' }, `+${dayEvents.length - 4} more`) : null,
        ]
      );
      daysGrid.appendChild(cell);
    }

    grid.appendChild(daysGrid);

    if (isLoading) {
      grid.appendChild(el('div', { class: 'calendar-grid__loading' }, 'Loading events…'));
    }
  }

  renderHeader();
  loadEvents();
}
