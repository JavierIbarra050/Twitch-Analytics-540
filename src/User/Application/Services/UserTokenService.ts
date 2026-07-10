import crypto from 'crypto';
import { IUserRepository } from '../../Domain/Repositories/IUserRepository';

export class UserTokenService {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly tokenExpirationDays: number,
    ) {}

    async generateToken(email: string, apiKey: string): Promise<string> {
        const user = await this.userRepository.findByEmail(email);

        if (!user || user.getUserApiKey() !== apiKey) {
            throw new Error('Unauthorized');
        }

        const token = this.generateRandomToken();
        const expiresAt = this.calculateExpirationDate();

        await this.userRepository.saveToken(email, token, expiresAt);

        return token;
    }

    private generateRandomToken(): string {
        return crypto.randomBytes(32).toString('hex');
    }

    private calculateExpirationDate(): Date {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + this.tokenExpirationDays);
        return expiresAt;
    }
}
