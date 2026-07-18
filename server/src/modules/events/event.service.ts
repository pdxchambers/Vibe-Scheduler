import { v4 as uuid } from 'uuid';
import { Repository } from '../../db/Repository';
import { CalendarEvent, CreateEventInput, UpdateEventInput } from './event.model';
import { ApiError } from '../../utils/ApiError';

export interface ListEventsOptions {
  from?: string; // ISO date - only events overlapping on/after this
  to?: string; // ISO date - only events overlapping on/before this
}

export class EventService {
  constructor(private readonly eventRepository: Repository<CalendarEvent>) {}

  async listForUser(userId: string, options: ListEventsOptions = {}): Promise<CalendarEvent[]> {
    const events = await this.eventRepository.findWhere((e) => e.userId === userId);

    const fromTime = options.from ? new Date(options.from).getTime() : undefined;
    const toTime = options.to ? new Date(options.to).getTime() : undefined;

    const filtered = events.filter((event) => {
      const start = new Date(event.startTime).getTime();
      const end = new Date(event.endTime).getTime();
      if (fromTime !== undefined && end < fromTime) return false;
      if (toTime !== undefined && start > toTime) return false;
      return true;
    });

    return filtered.sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );
  }

  async getForUser(userId: string, eventId: string): Promise<CalendarEvent> {
    const event = await this.eventRepository.findById(eventId);
    if (!event || event.userId !== userId) {
      throw ApiError.notFound('Event not found');
    }
    return event;
  }

  async create(userId: string, input: CreateEventInput): Promise<CalendarEvent> {
    this.assertValidRange(input.startTime, input.endTime);

    const now = new Date().toISOString();
    const event: CalendarEvent = {
      id: uuid(),
      userId,
      title: input.title.trim(),
      description: input.description?.trim() ?? '',
      location: input.location?.trim() ?? '',
      startTime: input.startTime,
      endTime: input.endTime,
      allDay: input.allDay ?? false,
      color: input.color ?? '#3b82f6',
      recurrence: input.recurrence ?? 'none',
      createdAt: now,
      updatedAt: now,
    };

    return this.eventRepository.create(event);
  }

  async update(userId: string, eventId: string, updates: UpdateEventInput): Promise<CalendarEvent> {
    const existing = await this.getForUser(userId, eventId);

    const nextStart = updates.startTime ?? existing.startTime;
    const nextEnd = updates.endTime ?? existing.endTime;
    this.assertValidRange(nextStart, nextEnd);

    const updated = await this.eventRepository.update(eventId, {
      ...updates,
      title: updates.title?.trim() ?? existing.title,
      description: updates.description?.trim() ?? existing.description,
      location: updates.location?.trim() ?? existing.location,
      updatedAt: new Date().toISOString(),
    });

    return updated!;
  }

  async delete(userId: string, eventId: string): Promise<void> {
    await this.getForUser(userId, eventId); // ensures ownership + existence
    await this.eventRepository.delete(eventId);
  }

  private assertValidRange(startTime: string, endTime: string) {
    if (new Date(endTime).getTime() < new Date(startTime).getTime()) {
      throw ApiError.badRequest('"endTime" must not be before "startTime"');
    }
  }
}
