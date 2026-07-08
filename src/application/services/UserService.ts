import crypto from 'crypto';

import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/interfaces/IUserRepository";

export class UserService {
    constructor (
        private readonly userRepository: IUserRepository,
    ) {}

    async registerNewUser(email: string): Promise<User> {

        const newApiKey = this.generateApiKey();

        if (await this.userRepository.doesUserAlreadyExists(email)) {
            return await this.userRepository.saveUser(email, newApiKey);
        }

        const newUser = await this.userRepository.saveUser(email, newApiKey);
        return newUser;
    }

    generateApiKey(): string {
        const newApiKey = crypto.randomBytes(16).toString('hex'); 
        return newApiKey;   
    }
} 
