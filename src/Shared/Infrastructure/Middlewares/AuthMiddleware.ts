import { Request, Response, NextFunction } from 'express';
import { IUserRepository } from '../../../User/Domain/Repositories/IUserRepository';

export class AuthMiddleware {
    constructor(
        private readonly userRepository: IUserRepository,
    ) {}

    execute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({ error: 'Unauthorized. Token is invalid or expired.' });
                return;
            }

            const token = authHeader.split(' ')[1];

            const tokenValid = await this.userRepository.verifyToken(token);

            if (!tokenValid) {
                res.status(401).json({ error: 'Unauthorized. Token is invalid or expired.' });
                return;
            }

            next();
        } catch {
            res.status(500).json({ error: 'Internal server error.' });
        }
    };
}
