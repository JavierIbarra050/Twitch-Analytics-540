import { User } from "../Entities/User";

export interface IUserRepository {
    doesUserAlreadyExists(email: string): Promise<boolean>;

    saveUser(email: string, apiKey: string): Promise<User>; 
}
