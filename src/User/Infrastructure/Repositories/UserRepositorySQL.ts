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
}
