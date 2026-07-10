import { getDatabase } from '../../../Shared/Infrastructure/Database/database';
import { User } from '../../Domain/Entities/User';
import { IUserRepository } from '../../Domain/Repositories/IUserRepository';

export class UserRepositorySQL implements IUserRepository {

    async doesUserAlreadyExists(email: string): Promise<boolean> {
        const db = await getDatabase();
        const row = await db.get<{ id: number }>(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        return !!row;
    }

    async saveUser(email: string, apiKey: string): Promise<User> {
        const db = await getDatabase();
        await db.run(
            'INSERT INTO users (email, api_key) VALUES (?, ?) ON CONFLICT(email) DO UPDATE SET api_key = excluded.api_key',
            [email, apiKey]
        );
        return new User(email, apiKey);
    }

    async findByEmail(email: string): Promise<User | null> {
        const db = await getDatabase();
        const row = await db.get<{ email: string; api_key: string }>(
            'SELECT email, api_key FROM users WHERE email = ?',
            [email]
        );
        if (!row) return null;
        return new User(row.email, row.api_key);
    }

    async saveToken(email: string, token: string, expiresAt: Date): Promise<void> {
        const db = await getDatabase();
        const user = await db.get<{ id: number }>(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );
        if (!user) throw new Error(`User not found for email: ${email}`);
        await db.run(
            'INSERT INTO user_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
            [user.id, token, expiresAt.toISOString()]
        );
    }

    async verifyToken(token: string): Promise<boolean> {
        const db = await getDatabase();
        const tokenRecord = await db.get<{ id: number }>(
            "SELECT id FROM user_tokens WHERE token = ? AND expires_at > datetime('now')",
            [token]
        );
        return !!tokenRecord;
    }
}
