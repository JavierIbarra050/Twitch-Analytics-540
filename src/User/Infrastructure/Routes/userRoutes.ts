import { Router } from 'express';
import { UserRepositorySQL } from '../Repositories/UserRepositorySQL';
import { UserService } from '../../Application/Services/UserService';
import { UserController } from '../Controllers/UserController';
import { UserTokenService } from '../../Application/Services/UserTokenService';
import { UserTokenController } from '../Controllers/UserTokenController';

const router = Router();

const userRepository = new UserRepositorySQL();

const userService = new UserService(userRepository);
const userController = new UserController(userService);

const userTokenService = new UserTokenService(userRepository);
const userTokenController = new UserTokenController(userTokenService);

router.post('/register', userController.register);
router.post('/token', userTokenController.generateToken);

export default router;
