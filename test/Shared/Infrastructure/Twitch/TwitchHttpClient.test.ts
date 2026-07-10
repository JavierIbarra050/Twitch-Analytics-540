import { TwitchHttpClient } from '../../../../src/Shared/Infrastructure/Twitch/TwitchHttpClient';

describe('TwitchHttpClient Initialization', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        jest.resetModules();
        process.env = { ...originalEnv };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    it('should throw an error when TWITCH_CLIENT_ID is missing', () => {
        delete process.env.TWITCH_CLIENT_ID;
        process.env.TWITCH_CLIENT_SECRET = 'secret';

        expect(() => new TwitchHttpClient()).toThrow('TWITCH_CLIENT_ID environment variable is missing');
    });

    it('should throw an error when TWITCH_CLIENT_SECRET is missing', () => {
        process.env.TWITCH_CLIENT_ID = 'client-id';
        delete process.env.TWITCH_CLIENT_SECRET;

        expect(() => new TwitchHttpClient()).toThrow('TWITCH_CLIENT_SECRET environment variable is missing');
    });

    it('should instantiate successfully when both variables are defined', () => {
        process.env.TWITCH_CLIENT_ID = 'client-id';
        process.env.TWITCH_CLIENT_SECRET = 'secret';

        const client = new TwitchHttpClient();
        expect(client).toBeDefined();
    });
});
