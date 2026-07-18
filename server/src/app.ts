import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

import { JsonFileRepository } from './db/JsonFileRepository';
import { User } from './modules/users/user.model';
import { CalendarEvent } from './modules/events/event.model';

import { UserService } from './modules/users/user.service';
import { UserController } from './modules/users/user.controller';
import { createUserRouter } from './modules/users/user.routes';

import { AuthService } from './modules/auth/auth.service';
import { AuthController } from './modules/auth/auth.controller';
import { createAuthRouter } from './modules/auth/auth.routes';

import { EventService } from './modules/events/event.service';
import { EventController } from './modules/events/event.controller';
import { createEventRouter } from './modules/events/event.routes';

/**
 * Builds the Express application.
 *
 * This is a small manual "composition root": each feature module is wired
 * together here (repository -> service -> controller -> router) and mounted
 * under its own path. To add a new feature module in the future, create its
 * repository/service/controller/routes files following the same pattern as
 * `modules/events`, then add three lines here.
 */
export function createApp(): Express {
  const app = express();

  // --- Core middleware -----------------------------------------------
  app.use(
    cors({
      origin: env.clientOrigins,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  // --- Data layer (repositories) --------------------------------------
  const userRepository = new JsonFileRepository<User>(env.dataDir, 'users');
  const eventRepository = new JsonFileRepository<CalendarEvent>(env.dataDir, 'events');

  // --- Services ---------------------------------------------------------
  const userService = new UserService(userRepository);
  const authService = new AuthService(userService);
  const eventService = new EventService(eventRepository);

  // --- Controllers --------------------------------------------------------
  const userController = new UserController(userService);
  const authController = new AuthController(authService);
  const eventController = new EventController(eventService);

  // --- Routes ------------------------------------------------------------
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/auth', createAuthRouter(authController));
  app.use('/api/users', createUserRouter(userController));
  app.use('/api/events', createEventRouter(eventController));

  // --- Fallbacks -----------------------------------------------------
  app.use('/api', notFoundHandler);
  app.use(errorHandler);

  return app;
}
