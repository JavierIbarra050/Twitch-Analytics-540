import { Request, Response } from 'express';
import { UserTokenService } from '../../Application/Services/UserTokenService';

export class UserTokenController {
    constructor(
        private readonly userTokenService: UserTokenService,
    ) {}

    public generateToken = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, api_key } = req.body;

            if (!email) {
                res.status(400).json({ error: 'The email is mandatory' });
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                res.status(400).json({ error: 'The email must be a valid email address' });
                return;
            }

            if (!api_key) {
                res.status(400).json({ error: 'The api_key is mandatory' });
                return;
            }

            const token = await this.userTokenService.generateToken(email, api_key);

            res.status(200).json({ token });
        } catch (error: any) {
            if (error.message && error.message.includes('Unauthorized')) {
                res.status(401).json({ error: 'Unauthorized. API access token is invalid.' });
                return;
            }

            res.status(500).json({ error: 'Internal server error.' });
        }
    };
}
