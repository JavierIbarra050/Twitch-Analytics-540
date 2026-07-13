"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
class AuthMiddleware {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    execute = async (req, res, next) => {
        try {
            const authHeader = req.headers.authorization;
            if (typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
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
        }
        catch {
            res.status(500).json({ error: 'Internal server error.' });
        }
    };
}
exports.AuthMiddleware = AuthMiddleware;
