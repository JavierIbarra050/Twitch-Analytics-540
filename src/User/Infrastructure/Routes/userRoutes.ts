import { Router } from 'express';
import { userController, userTokenController } from '../../../Shared/Infrastructure/container';
import { authRoutesRateLimiter } from '../../../Shared/Infrastructure/Middlewares/RateLimiter';

const router = Router();

router.post('/register', authRoutesRateLimiter, userController.register);
router.post('/token', authRoutesRateLimiter, userTokenController.generateToken);

export default router;
