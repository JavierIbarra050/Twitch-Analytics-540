import { UserRepositorySQL } from 'User/Infrastructure/Repositories/UserRepositorySQL';
import { User } from 'User/Domain/Entities/User';
import * as databaseModule from 'Shared/Infrastructure/Database/database';

const mockDb = {
    get: jest.fn(),
    run: jest.fn(),
};

jest.mock('Shared/Infrastructure/Database/database', () => ({
    getDatabase: jest.fn(),
}));

describe('UserRepositorySQL', () => {
    let repository: UserRepositorySQL;

    beforeEach(() => {
        jest.clearAllMocks();
        (databaseModule.getDatabase as jest.Mock).mockResolvedValue(mockDb);
        repository = new UserRepositorySQL();
    });

    describe('doesUserAlreadyExists', () => {
        it('should return true when user exists in DB', async () => {
            mockDb.get.mockResolvedValue({ id: 1 });

            const result = await repository.doesUserAlreadyExists('existing@example.com');

            expect(mockDb.get).toHaveBeenCalledWith(
                'SELECT id FROM users WHERE email = ?',
                ['existing@example.com']
            );
            expect(result).toBe(true);
        });

        it('should return false when user does not exist', async () => {
            mockDb.get.mockResolvedValue(undefined);

            const result = await repository.doesUserAlreadyExists('new@example.com');

            expect(mockDb.get).toHaveBeenCalledWith(
                'SELECT id FROM users WHERE email = ?',
                ['new@example.com']
            );
            expect(result).toBe(false);
        });
    });

    describe('saveUser', () => {
        it('should insert a new user and return a User entity', async () => {
            const email = 'newuser@example.com';
            const apiKey = 'abc123def456abc1';

            mockDb.run.mockResolvedValue(undefined);

            const result = await repository.saveUser(email, apiKey);

            expect(mockDb.run).toHaveBeenCalledWith(
                'INSERT INTO users (email, api_key) VALUES (?, ?) ON CONFLICT(email) DO UPDATE SET api_key = excluded.api_key',
                [email, apiKey]
            );
            expect(result).toBeInstanceOf(User);
            expect(result.getUserEmail()).toBe(email);
            expect(result.getUserApiKey()).toBe(apiKey);
        });

        it('should upsert when email already exists', async () => {
            const email = 'existing@example.com';
            const newApiKey = 'newkey123newkey1';

            mockDb.run.mockResolvedValue(undefined);

            const result = await repository.saveUser(email, newApiKey);

            expect(mockDb.run).toHaveBeenCalledWith(
                'INSERT INTO users (email, api_key) VALUES (?, ?) ON CONFLICT(email) DO UPDATE SET api_key = excluded.api_key',
                [email, newApiKey]
            );
            expect(result).toBeInstanceOf(User);
            expect(result.getUserEmail()).toBe(email);
            expect(result.getUserApiKey()).toBe(newApiKey);
        });
    });

    describe('findByEmail', () => {
        it('should return a User when found', async () => {
            const email = 'found@example.com';
            const apiKey = 'foundkey123found';

            mockDb.get.mockResolvedValue({ email, api_key: apiKey });

            const result = await repository.findByEmail(email);

            expect(mockDb.get).toHaveBeenCalledWith(
                'SELECT email, api_key FROM users WHERE email = ?',
                [email]
            );
            expect(result).toBeInstanceOf(User);
            expect(result!.getUserEmail()).toBe(email);
            expect(result!.getUserApiKey()).toBe(apiKey);
        });

        it('should return null when not found', async () => {
            mockDb.get.mockResolvedValue(undefined);

            const result = await repository.findByEmail('notfound@example.com');

            expect(mockDb.get).toHaveBeenCalledWith(
                'SELECT email, api_key FROM users WHERE email = ?',
                ['notfound@example.com']
            );
            expect(result).toBeNull();
        });
    });

    describe('saveToken', () => {
        it('should insert a token linked to the user', async () => {
            const email = 'user@example.com';
            const token = 'sometoken64charslong0000000000000000000000000000000000000000000';
            const expiresAt = new Date('2026-07-13T00:00:00.000Z');

            mockDb.get.mockResolvedValue({ id: 42 });
            mockDb.run.mockResolvedValue(undefined);

            await repository.saveToken(email, token, expiresAt);

            expect(mockDb.get).toHaveBeenCalledWith(
                'SELECT id FROM users WHERE email = ?',
                [email]
            );
            expect(mockDb.run).toHaveBeenCalledWith(
                'INSERT INTO user_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
                [42, token, expiresAt.toISOString()]
            );
        });

        it('should throw when user does not exist', async () => {
            const email = 'ghost@example.com';
            const token = 'sometoken64charslong0000000000000000000000000000000000000000000';
            const expiresAt = new Date('2026-07-13T00:00:00.000Z');

            mockDb.get.mockResolvedValue(undefined);

            await expect(repository.saveToken(email, token, expiresAt))
                .rejects
                .toThrow(`User not found for email: ${email}`);

            expect(mockDb.run).not.toHaveBeenCalled();
        });
    });

    describe('verifyToken', () => {
        it('should return true when token is found and is valid', async () => {
            const token = 'validtoken';
            mockDb.get.mockResolvedValue({ id: 5 });

            const result = await repository.verifyToken(token);

            expect(mockDb.get).toHaveBeenCalledWith(
                "SELECT id FROM user_tokens WHERE token = ? AND expires_at > datetime('now')",
                [token]
            );
            expect(result).toBe(true);
        });

        it('should return false when token is not found or expired', async () => {
            const token = 'invalidtoken';
            mockDb.get.mockResolvedValue(undefined);

            const result = await repository.verifyToken(token);

            expect(mockDb.get).toHaveBeenCalledWith(
                "SELECT id FROM user_tokens WHERE token = ? AND expires_at > datetime('now')",
                [token]
            );
            expect(result).toBe(false);
        });
    });
});
