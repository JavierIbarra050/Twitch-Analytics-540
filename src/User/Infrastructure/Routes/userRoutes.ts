import { Router } from 'express';
import { userController, userTokenController } from '../../../Shared/Infrastructure/container';

const router = Router();

router.post('/register', userController.register);
router.post('/token', userTokenController.generateToken);

export default router;
