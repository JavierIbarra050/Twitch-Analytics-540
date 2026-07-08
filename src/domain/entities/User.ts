export class User {
    constructor (
        private readonly email: string,
        private apiKey: string,
    ) { }

    public getUserEmail(): string {
        return this.email;
    }

    public getUserApiKey(): string {
        return this.apiKey;
    }
}