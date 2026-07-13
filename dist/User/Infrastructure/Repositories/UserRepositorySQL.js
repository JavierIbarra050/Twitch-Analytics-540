"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepositorySQL = void 0;
const database_1 = require("../../../Shared/Infrastructure/Database/database");
const User_1 = require("../../Domain/Entities/User");
class UserRepositorySQL {
    async doesUserAlreadyExists(email) {
        const db = await (0, database_1.getDatabase)();
        const row = await db.get('SELECT id FROM users WHERE email = ?', [email]);
        return !!row;
    }
    async saveUser(email, apiKey) {
        const db = await (0, database_1.getDatabase)();
        if (db.type === 'mysql') {
            await db.run('INSERT INTO users (email, api_key) VALUES (?, ?) ON DUPLICATE KEY UPDATE api_key = VALUES(api_key)', [email, apiKey]);
        }
        else {
            await db.run('INSERT INTO users (email, api_key) VALUES (?, ?) ON CONFLICT(email) DO UPDATE SET api_key = excluded.api_key', [email, apiKey]);
        }
        return new User_1.User(email, apiKey);
    }
    async findByEmail(email) {
        const db = await (0, database_1.getDatabase)();
        const row = await db.get('SELECT email, api_key FROM users WHERE email = ?', [email]);
        if (!row)
            return null;
        return new User_1.User(row.email, row.api_key);
    }
    async saveToken(email, token, expiresAt) {
        const db = await (0, database_1.getDatabase)();
        const user = await db.get('SELECT id FROM users WHERE email = ?', [email]);
        if (!user)
            throw new Error(`User not found for email: ${email}`);
        await db.run('INSERT INTO user_tokens (user_id, token, expires_at) VALUES (?, ?, ?)', [user.id, token, expiresAt.toISOString()]);
    }
    async verifyToken(token) {
        const db = await (0, database_1.getDatabase)();
        let tokenRecord;
        if (db.type === 'mysql') {
            tokenRecord = await db.get('SELECT id FROM user_tokens WHERE token = ? AND expires_at > NOW()', [token]);
        }
        else {
            tokenRecord = await db.get("SELECT id FROM user_tokens WHERE token = ? AND datetime(expires_at) > datetime('now')", [token]);
        }
        return !!tokenRecord;
    }
}
exports.UserRepositorySQL = UserRepositorySQL;
