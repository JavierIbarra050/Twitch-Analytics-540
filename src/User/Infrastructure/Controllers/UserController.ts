import { Request, Response } from 'express';
import { UserService } from '../../Application/Services/UserService';
import { Email } from '../../Domain/ValueObjects/Email';

export class UserController {
    constructor(
        private readonly userService: UserService,
    ) {}

    public register = async (req: Request, res: Response): Promise<void> => {
        try {
            let emailVo: Email;
            try {
                emailVo = new Email(req.body.email);
            } catch (error: any) {
                res.status(400).json({ error: error.message });
                return;
            }

            const user = await this.userService.registerNewUser(emailVo.toString());

            res.status(200).json({ api_key: user.getUserApiKey() });
        } catch {
            res.status(500).json({ error: 'Internal server error.' });
        }
    };
}
