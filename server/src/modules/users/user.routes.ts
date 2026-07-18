import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { asyncHandler } from '../../utils/asyncHandler';
import { UserController } from './user.controller';

export function createUserRouter(userController: UserController): Router {
  const router = Router();

  router.use(requireAuth);

  router.get('/me', asyncHandler(userController.getMe));
  router.patch('/me', asyncHandler(userController.updateProfile));
  router.patch('/me/preferences', asyncHandler(userController.updatePreferences));

  return router;
}
