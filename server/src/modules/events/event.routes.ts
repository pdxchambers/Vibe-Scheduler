import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import { EventController } from './event.controller';

export function createEventRouter(eventController: EventController): Router {
  const router = Router();

  router.use(requireAuth);

  router.get('/', asyncHandler(eventController.list));
  router.post('/', asyncHandler(eventController.create));
  router.get('/:id', asyncHandler(eventController.getOne));
  router.patch('/:id', asyncHandler(eventController.update));
  router.delete('/:id', asyncHandler(eventController.remove));

  return router;
}
