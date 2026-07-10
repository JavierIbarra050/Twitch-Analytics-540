import { Config } from '../../../../src/Shared/Infrastructure/Config/config';

describe('Config environment variable validation', () => {
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

        expect(() => new Config()).toThrow('TWITCH_CLIENT_ID environment variable is missing');
    });

    it('should throw an error when TWITCH_CLIENT_SECRET is missing', () => {
        process.env.TWITCH_CLIENT_ID = 'client-id';
        delete process.env.TWITCH_CLIENT_SECRET;

        expect(() => new Config()).toThrow('TWITCH_CLIENT_SECRET environment variable is missing');
    });

    it('should read and parse environment variables correctly when defined', () => {
        process.env.PORT = '8080';
        process.env.TWITCH_CLIENT_ID = 'client-id';
        process.env.TWITCH_CLIENT_SECRET = 'secret';

        const configInstance = new Config();
        expect(configInstance.port).toBe(8080);
        expect(configInstance.twitchClientId).toBe('client-id');
        expect(configInstance.twitchClientSecret).toBe('secret');
    });
});
