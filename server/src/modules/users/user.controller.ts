import { Request, Response } from 'express';
import { UserService } from './user.service';
import { toPublicUser } from './user.model';
import { assertOneOf, assertString } from '../../utils/validate';
import { ApiError } from '../../utils/ApiError';

export class UserController {
  constructor(private readonly userService: UserService) {}

  getMe = async (req: Request, res: Response) => {
    const user = await this.userService.findById(req.user!.id);
    if (!user) throw ApiError.notFound('User not found');
    res.json(toPublicUser(user));
  };

  updateProfile = async (req: Request, res: Response) => {
    const displayName = assertString(req.body.displayName, 'displayName', {
      minLength: 1,
      maxLength: 80,
    });
    const user = await this.userService.updateProfile(req.user!.id, { displayName });
    res.json(toPublicUser(user));
  };

  updatePreferences = async (req: Request, res: Response) => {
    const body = req.body ?? {};
    const updates: Record<string, unknown> = {};

    if (body.theme !== undefined) {
      updates.theme = assertOneOf(body.theme, 'theme', ['light', 'dark', 'system'] as const);
    }
    if (body.weekStartsOn !== undefined) {
      updates.weekStartsOn = assertOneOf(body.weekStartsOn, 'weekStartsOn', ['sunday', 'monday'] as const);
    }
    if (body.timeFormat !== undefined) {
      updates.timeFormat = assertOneOf(body.timeFormat, 'timeFormat', ['12h', '24h'] as const);
    }
    if (body.defaultEventColor !== undefined) {
      updates.defaultEventColor = assertString(body.defaultEventColor, 'defaultEventColor', {
        minLength: 3,
        maxLength: 20,
      });
    }

    const user = await this.userService.updatePreferences(req.user!.id, updates);
    res.json(toPublicUser(user));
  };
}
