import { Request, Response } from 'express';
import { UserTokenService } from '../../Application/Services/UserTokenService';
import { Email } from '../../Domain/ValueObjects/Email';

export class UserTokenController {
    constructor(
        private readonly userTokenService: UserTokenService,
    ) {}

    public generateToken = async (req: Request, res: Response): Promise<void> => {
        try {
            const api_key = req.body?.api_key;

            let emailVo: Email;
            try {
                emailVo = new Email(req.body?.email);
            } catch (error: any) {
                res.status(400).json({ error: error.message });
                return;
            }

            if (!api_key) {
                res.status(400).json({ error: 'The api_key is mandatory' });
                return;
            }

            const token = await this.userTokenService.generateToken(emailVo.toString(), api_key);

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
