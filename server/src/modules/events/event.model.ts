import { Entity } from '../../db/Repository';

export type RecurrenceFrequency = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface CalendarEvent extends Entity {
  userId: string;
  title: string;
  description: string;
  location: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
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
