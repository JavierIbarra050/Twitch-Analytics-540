import { Request, Response } from 'express';
import { UserService } from '../../Application/Services/UserService';

export class UserController {
    constructor(
        private readonly userService: UserService,
    ) {}

    public register = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email } = req.body;

            if (!email) {
                res.status(400).json({ error: 'The email is mandatory' });
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                res.status(400).json({ error: 'The email must be a valid email address' });
                return;
            }

            const user = await this.userService.registerNewUser(email);

            res.status(200).json({ api_key: user.getUserApiKey() });
        } catch {
            res.status(500).json({ error: 'Internal server error.' });
        }
    };
}
