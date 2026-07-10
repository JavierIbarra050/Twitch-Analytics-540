import crypto from 'crypto';

import { User } from "../../Domain/Entities/User";
import { IUserRepository } from "../../Domain/Repositories/IUserRepository";

export class UserService {
    constructor (
        private readonly userRepository: IUserRepository,
    ) {}

    async registerNewUser(email: string): Promise<User> {
        const newApiKey = this.generateApiKey();
        return await this.userRepository.saveUser(email, newApiKey);
    }

    generateApiKey(): string {
        const newApiKey = crypto.randomBytes(16).toString('hex'); 
        return newApiKey;   
    }
}
