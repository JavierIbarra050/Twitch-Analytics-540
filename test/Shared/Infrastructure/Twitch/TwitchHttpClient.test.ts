import axios from 'axios';
import { TwitchHttpClient } from '../../../../src/Shared/Infrastructure/Twitch/TwitchHttpClient';
import { TwitchUnauthorizedError } from '../../../../src/Shared/Infrastructure/Twitch/TwitchUnauthorizedError';
import { Config } from '../../../../src/Shared/Infrastructure/Config/config';

jest.mock('axios');
const mockedAxios = jest.mocked(axios);

describe('TwitchHttpClient', () => {
    const mockConfig = {
        port: 3000,
        twitchClientId: 'client-id',
        twitchClientSecret: 'secret'
    } as Config;

    const unauthorizedError = {
        response: { status: 401 }
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockedAxios.post.mockResolvedValue({
            data: {
                access_token: 'app-access-token',
                expires_in: 3600,
                token_type: 'bearer'
            }
        });
    });

    it('should initialize successfully when config is injected', () => {
        const client = new TwitchHttpClient(mockConfig);
        expect(client).toBeDefined();
    });

    it('should return data from a successful request', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: { data: [] } });

        const client = new TwitchHttpClient(mockConfig);
        const result = await client.get('streams');

        expect(result).toEqual({ data: [] });
    });

    it('should request the access token with the required Twitch OAuth parameters', async () => {
        mockedAxios.get.mockResolvedValueOnce({ data: { data: [] } });

        const client = new TwitchHttpClient(mockConfig);
        await client.get('streams');

        expect(mockedAxios.post).toHaveBeenCalledWith(
            'https://id.twitch.tv/oauth2/token',
            null,
            expect.objectContaining({
                params: {
                    client_id: mockConfig.twitchClientId,
                    client_secret: mockConfig.twitchClientSecret,
                    grant_type: 'client_credentials'
                }
            })
        );
    });

    it('should retry once with a fresh token when the first request returns 401', async () => {
        mockedAxios.get
            .mockRejectedValueOnce(unauthorizedError)
            .mockResolvedValueOnce({ data: { data: ['ok'] } });

        const client = new TwitchHttpClient(mockConfig);
        const result = await client.get('streams');

        expect(result).toEqual({ data: ['ok'] });
        expect(mockedAxios.post).toHaveBeenCalledTimes(2);
        expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    it('should throw TwitchUnauthorizedError when the retried request also returns 401', async () => {
        mockedAxios.get
            .mockRejectedValueOnce(unauthorizedError)
            .mockRejectedValueOnce(unauthorizedError);

        const client = new TwitchHttpClient(mockConfig);

        await expect(client.get('streams')).rejects.toBeInstanceOf(TwitchUnauthorizedError);
    });

    it('should propagate non-401 errors without retrying', async () => {
        const serverError = { response: { status: 500 } };
        mockedAxios.get.mockRejectedValueOnce(serverError);

        const client = new TwitchHttpClient(mockConfig);

        await expect(client.get('streams')).rejects.toBe(serverError);
        expect(mockedAxios.get).toHaveBeenCalledTimes(1);
    });
});
