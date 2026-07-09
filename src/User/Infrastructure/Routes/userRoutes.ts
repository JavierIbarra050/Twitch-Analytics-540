import { Router } from 'express';
import { UserSQLiteRepository } from '../Repositories/UserSQLiteRepository';
import { UserService } from '../../Application/Services/UserService';
import { UserController } from '../Controllers/UserController';

const router = Router();

const userRepository = new UserSQLiteRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

router.post('/register', userController.register);

export default router;
