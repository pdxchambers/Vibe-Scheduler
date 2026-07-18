export type ThemePreference = 'light' | 'dark' | 'system';
export type WeekStartDay = 'sunday' | 'monday';
export type TimeFormatPreference = '12h' | '24h';

export interface UserPreferences {
  theme: ThemePreference;
  weekStartsOn: WeekStartDay;
  timeFormat: TimeFormatPreference;
  defaultEventColor: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export type RecurrenceFrequency = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  color: string;
  recurrence: RecurrenceFrequency;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventInput {
  title: string;
  description?: string;
  location?: string;
  startTime: string;
  endTime: string;
  allDay?: boolean;
  color?: string;
  recurrence?: RecurrenceFrequency;
}

export type UpdateEventInput = Partial<CreateEventInput>;
