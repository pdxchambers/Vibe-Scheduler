import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { AuthController } from './auth.controller';

export function createAuthRouter(authController: AuthController): Router {
  const router = Router();

  router.post('/register', asyncHandler(authController.register));
  router.post('/login', asyncHandler(authController.login));
  router.post('/logout', asyncHandler(authController.logout));

  return router;
}
