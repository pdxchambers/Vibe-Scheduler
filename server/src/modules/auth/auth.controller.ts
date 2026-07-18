import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { toPublicUser } from '../users/user.model';
import { assertEmail, assertString } from '../../utils/validate';
import { env } from '../../config/env';

const COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function setAuthCookie(res: Response, token: string) {
  res.cookie(env.authCookieName, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE_MS,
    path: '/',
  });
}

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = async (req: Request, res: Response) => {
    const email = assertEmail(req.body.email);
    const password = assertString(req.body.password, 'password', { minLength: 8, maxLength: 128 });
    const displayName = assertString(req.body.displayName ?? '', 'displayName', { maxLength: 80 });

    const user = await this.authService.register(email, password, displayName);
    const token = this.authService.issueToken(user);
    setAuthCookie(res, token);

    res.status(201).json({ user: toPublicUser(user), token });
  };

  login = async (req: Request, res: Response) => {
    const email = assertEmail(req.body.email);
    const password = assertString(req.body.password, 'password', { minLength: 1 });

    const user = await this.authService.login(email, password);
    const token = this.authService.issueToken(user);
    setAuthCookie(res, token);

    res.json({ user: toPublicUser(user), token });
  };

  logout = async (_req: Request, res: Response) => {
    res.clearCookie(env.authCookieName, { path: '/' });
    res.status(204).send();
  };
}
