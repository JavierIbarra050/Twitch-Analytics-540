import { User } from "../Entities/User";

export interface IUserRepository {
    doesUserAlreadyExists(email: string): Promise<boolean>;
    saveUser(email: string, apiKey: string): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    saveToken(email: string, token: string, expiresAt: Date): Promise<void>;
    verifyToken(token: string): Promise<boolean>;
}
