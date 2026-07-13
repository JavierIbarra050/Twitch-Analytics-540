export class TwitchUnauthorizedError extends Error {
    constructor() {
        super('Twitch access token is invalid or has expired.');
        this.name = 'TwitchUnauthorizedError';
    }
}
