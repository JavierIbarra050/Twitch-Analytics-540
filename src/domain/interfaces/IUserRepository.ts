import { User } from "../entities/User";

export interface IUserRepository {
    doesUserAlreadyExists(email: string): Promise<boolean>;

    saveUser(email: string, apiKey: string): Promise<User>; 
}