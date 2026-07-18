import { Request, Response } from 'express';
import { EventService } from './event.service';
import { assertIsoDate, assertOneOf, assertString } from '../../utils/validate';
import { CreateEventInput, RecurrenceFrequency, UpdateEventInput } from './event.model';
import { ApiError } from '../../utils/ApiError';

const RECURRENCE_VALUES = ['none', 'daily', 'weekly', 'monthly', 'yearly'] as const;

function parseCreateInput(body: any): CreateEventInput {
  const title = assertString(body.title, 'title', { minLength: 1, maxLength: 200 });
  const startTime = assertIsoDate(body.startTime, 'startTime');
  const endTime = assertIsoDate(body.endTime, 'endTime');

  const input: CreateEventInput = { title, startTime, endTime };

  if (body.description !== undefined) {
    input.description = assertString(body.description, 'description', { maxLength: 5000 });
  }
  if (body.location !== undefined) {
    input.location = assertString(body.location, 'location', { maxLength: 300 });
  }
  if (body.allDay !== undefined) {
    if (typeof body.allDay !== 'boolean') throw ApiError.badRequest('"allDay" must be a boolean');
    input.allDay = body.allDay;
  }
  if (body.color !== undefined) {
    input.color = assertString(body.color, 'color', { minLength: 3, maxLength: 20 });
  }
  if (body.recurrence !== undefined) {
    input.recurrence = assertOneOf<RecurrenceFrequency>(body.recurrence, 'recurrence', RECURRENCE_VALUES);
  }

  return input;
}

function parseUpdateInput(body: any): UpdateEventInput {
  const input: UpdateEventInput = {};

  if (body.title !== undefined) input.title = assertString(body.title, 'title', { minLength: 1, maxLength: 200 });
  if (body.description !== undefined) input.description = assertString(body.description, 'description', { maxLength: 5000 });
  if (body.location !== undefined) input.location = assertString(body.location, 'location', { maxLength: 300 });
  if (body.startTime !== undefined) input.startTime = assertIsoDate(body.startTime, 'startTime');
  if (body.endTime !== undefined) input.endTime = assertIsoDate(body.endTime, 'endTime');
  if (body.allDay !== undefined) {
    if (typeof body.allDay !== 'boolean') throw ApiError.badRequest('"allDay" must be a boolean');
    input.allDay = body.allDay;
  }
  if (body.color !== undefined) input.color = assertString(body.color, 'color', { minLength: 3, maxLength: 20 });
  if (body.recurrence !== undefined) {
    input.recurrence = assertOneOf<RecurrenceFrequency>(body.recurrence, 'recurrence', RECURRENCE_VALUES);
  }

  return input;
}

export class EventController {
  constructor(private readonly eventService: EventService) {}

  list = async (req: Request, res: Response) => {
    const { from, to } = req.query;
    const events = await this.eventService.listForUser(req.user!.id, {
      from: typeof from === 'string' ? from : undefined,
      to: typeof to === 'string' ? to : undefined,
    });
    res.json(events);
  };

  getOne = async (req: Request, res: Response) => {
    const event = await this.eventService.getForUser(req.user!.id, req.params.id);
    res.json(event);
  };

  create = async (req: Request, res: Response) => {
    const input = parseCreateInput(req.body ?? {});
    const event = await this.eventService.create(req.user!.id, input);
    res.status(201).json(event);
  };

  update = async (req: Request, res: Response) => {
    const input = parseUpdateInput(req.body ?? {});
    const event = await this.eventService.update(req.user!.id, req.params.id, input);
    res.json(event);
  };

  remove = async (req: Request, res: Response) => {
    await this.eventService.delete(req.user!.id, req.params.id);
    res.status(204).send();
  };
}
