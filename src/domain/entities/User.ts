import crypto from 'crypto';

export class User {
    constructor (
        private readonly email: string,
        private apiKey?: string,
    ) {
        this.apiKey = apiKey || this.generateApiKey();
    }

    generateApiKey(): string {
        const newApiKey = crypto.randomBytes(16).toString('hex'); 
        return newApiKey;   
    }

    public getUserEmail(): string {
        return this.email;
    }

    public getUserApiKey(): string | null {
        return this.apiKey || null;
    }
}