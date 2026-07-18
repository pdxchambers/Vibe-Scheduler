import { apiRequest } from './client';
import { CalendarEvent, CreateEventInput, UpdateEventInput } from './types';

export interface ListEventsOptions {
  from?: string;
  to?: string;
}

function toQueryString(options: ListEventsOptions): string {
  const params = new URLSearchParams();
  if (options.from) params.set('from', options.from);
  if (options.to) params.set('to', options.to);
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const eventsApi = {
  list(options: ListEventsOptions = {}): Promise<CalendarEvent[]> {
    return apiRequest(`/events${toQueryString(options)}`);
  },

  get(id: string): Promise<CalendarEvent> {
    return apiRequest(`/events/${id}`);
  },

  create(input: CreateEventInput): Promise<CalendarEvent> {
    return apiRequest('/events', { method: 'POST', body: input });
  },

  update(id: string, updates: UpdateEventInput): Promise<CalendarEvent> {
    return apiRequest(`/events/${id}`, { method: 'PATCH', body: updates });
  },

  remove(id: string): Promise<void> {
    return apiRequest(`/events/${id}`, { method: 'DELETE' });
  },
};
