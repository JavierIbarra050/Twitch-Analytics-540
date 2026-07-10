import { TwitchHttpClient } from '../../../../src/Shared/Infrastructure/Twitch/TwitchHttpClient';
import { Config } from '../../../../src/Shared/Infrastructure/Config/config';

describe('TwitchHttpClient Initialization', () => {
    it('should initialize successfully when config is injected', () => {
        const mockConfig = {
            port: 3000,
            twitchClientId: 'client-id',
            twitchClientSecret: 'secret'
        } as Config;

        const client = new TwitchHttpClient(mockConfig);
        expect(client).toBeDefined();
    });
});
