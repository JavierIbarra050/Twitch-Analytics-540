import { TwitchClient } from '../../../../src/TopOfTheTops/Infrastructure/Repositories/TwitchClient';
import { TwitchHttpClient } from '../../../../src/Shared/Infrastructure/Twitch/TwitchHttpClient';

jest.mock('../../../../src/Shared/Infrastructure/Twitch/TwitchHttpClient');

describe('TwitchClient in TopOfTheTops module', () => {
    let client: TwitchClient;
    let httpClientMock: jest.Mocked<TwitchHttpClient>;

    beforeEach(() => {
        httpClientMock = new TwitchHttpClient() as jest.Mocked<TwitchHttpClient>;
        client = new TwitchClient(httpClientMock);
    });

    it('should fetch top games from Twitch', async () => {
        const mockGames = [
            { id: '509658', name: 'Just Chatting' },
            { id: '33214', name: 'League of Legends' }
        ];
        httpClientMock.get.mockResolvedValue({ data: mockGames });

        const games = await client.getTopGames(2);

        expect(httpClientMock.get).toHaveBeenCalledWith('games/top', { first: 2 });
        expect(games).toEqual(mockGames);
    });

    it('should fetch top videos of a game from Twitch', async () => {
        const mockVideos = [
            { id: '123', title: 'Top Video 1', view_count: 100 },
            { id: '456', title: 'Top Video 2', view_count: 50 }
        ];
        httpClientMock.get.mockResolvedValue({ data: mockVideos });

        const videos = await client.getTopVideosByGame('509658', 2);

        expect(httpClientMock.get).toHaveBeenCalledWith('videos', {
            game_id: '509658',
            period: 'all',
            sort: 'views',
            first: 2
        });
        expect(videos).toEqual(mockVideos);
    });
});
