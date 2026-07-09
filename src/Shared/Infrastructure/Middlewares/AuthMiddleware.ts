import { Request, Response, NextFunction } from 'express';
import { getDatabase } from '../Database/database';

export class AuthMiddleware {

    execute = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({ error: 'Unauthorized. Token is invalid or expired.' });
                return;
            }

            const token = authHeader.split(' ')[1];

            const db = await getDatabase();

            const tokenRecord = await db.get(
                "SELECT id FROM user_tokens WHERE token = ? AND expires_at > datetime('now')",
                [token]
            );

            if (!tokenRecord) {
                res.status(401).json({ error: 'Unauthorized. Token is invalid or expired.' });
                return;
            }

            next();
        } catch {
            res.status(500).json({ error: 'Internal server error.' });
        }
    };
}
