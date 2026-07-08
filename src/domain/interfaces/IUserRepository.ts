import { User } from "domain/entities/User";

export interface IUserRepository {
    doesUserAlreadyExists(email: string): boolean;
    
    saveUser(email: string, apiKey: string): User; 
}