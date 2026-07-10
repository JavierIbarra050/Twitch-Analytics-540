import dotenv from 'dotenv';
dotenv.config();

export class Config {
    public readonly port: number;
    public readonly twitchClientId: string;
    public readonly twitchClientSecret: string;

    constructor() {
        this.port = Number(process.env.PORT || 3000);
        this.twitchClientId = process.env.TWITCH_CLIENT_ID || '';
        this.twitchClientSecret = process.env.TWITCH_CLIENT_SECRET || '';

        // Fail-fast validation for vital environment variables
        if (!this.twitchClientId) {
            throw new Error('TWITCH_CLIENT_ID environment variable is missing');
        }
        if (!this.twitchClientSecret) {
            throw new Error('TWITCH_CLIENT_SECRET environment variable is missing');
        }
    }
}

export const config = new Config();
