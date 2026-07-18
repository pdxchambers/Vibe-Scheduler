import { TimeFormatPreference, WeekStartDay } from '../../api/types';

export interface CalendarDay {
  date: Date;
  inCurrentMonth: boolean;
  isToday: boolean;
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/**
 * Builds a 6x7 grid of days for the given month, padded with the trailing
 * days of the previous month and the leading days of the next month so the
 * grid always renders full weeks.
 */
export function getMonthGrid(year: number, month: number, weekStartsOn: WeekStartDay): CalendarDay[] {
  const firstOfMonth = new Date(year, month, 1);
  const weekStartOffset = weekStartsOn === 'monday' ? 1 : 0;

  const firstWeekday = (firstOfMonth.getDay() - weekStartOffset + 7) % 7;
  const gridStart = new Date(year, month, 1 - firstWeekday);

  const today = startOfDay(new Date());
  const days: CalendarDay[] = [];

  for (let i = 0; i < 42; i++) {
    const date = new Date(gridStart);
    date.setDate(gridStart.getDate() + i);
    days.push({
      date,
      inCurrentMonth: date.getMonth() === month,
      isToday: isSameDay(date, today),
    });
  }

  return days;
}

export function getWeekdayLabels(weekStartsOn: WeekStartDay): string[] {
  const base = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  if (weekStartsOn === 'monday') {
    return [...base.slice(1), base[0]];
  }
  return base;
}

export function formatMonthYear(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function formatDayHeading(date: Date): string {
  return date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export function formatTime(isoString: string, format: TimeFormatPreference): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12: format === '12h',
  });
}

/** Formats a Date as the value expected by <input type="datetime-local"> in the browser's local time. */
export function toDateTimeLocalValue(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(
    date.getMinutes()
  )}`;
}
