export class InvalidCredentialsError extends Error {
    constructor() {
        super('Invalid email or api_key.');
        this.name = 'InvalidCredentialsError';
    }
}
