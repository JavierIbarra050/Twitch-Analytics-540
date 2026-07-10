import dotenv from 'dotenv';
import path from 'path';
dotenv.config();

export class Config {
    public readonly port: number;
    public readonly twitchClientId: string;
    public readonly twitchClientSecret: string;
    public readonly databasePath: string;
    public readonly tokenExpirationDays: number;

    constructor() {
        this.port = Number(process.env.PORT || 3000);
        this.twitchClientId = process.env.TWITCH_CLIENT_ID || '';
        this.twitchClientSecret = process.env.TWITCH_CLIENT_SECRET || '';
        this.databasePath = process.env.DATABASE_PATH || path.resolve(__dirname, '../../../../database.sqlite');
        this.tokenExpirationDays = Number(process.env.TOKEN_EXPIRATION_DAYS || 3);

        if (!this.twitchClientId) {
            throw new Error('TWITCH_CLIENT_ID environment variable is missing');
        }
        if (!this.twitchClientSecret) {
            throw new Error('TWITCH_CLIENT_SECRET environment variable is missing');
        }
    }
}

export const config = new Config();
