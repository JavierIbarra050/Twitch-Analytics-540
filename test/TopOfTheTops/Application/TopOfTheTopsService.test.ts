import { TopOfTheTopsService } from '../../../src/TopOfTheTops/Application/Services/TopOfTheTopsService';
import { ITwitchClient } from '../../../src/TopOfTheTops/Domain/Repositories/ITwitchClient';
import { IGameCacheRepository } from '../../../src/TopOfTheTops/Domain/Repositories/IGameCacheRepository';
import { TopOfTheTops } from '../../../src/TopOfTheTops/Domain/Entities/TopOfTheTops';

describe('TopOfTheTopsService', () => {
    let service: TopOfTheTopsService;
    let twitchClientMock: jest.Mocked<ITwitchClient>;
    let cacheRepositoryMock: jest.Mocked<IGameCacheRepository>;

    beforeEach(() => {
        twitchClientMock = {
            getTopGames: jest.fn(),
            getTopVideosByGame: jest.fn()
        };
        cacheRepositoryMock = {
            getCachedStats: jest.fn(),
            saveCachedStats: jest.fn(),
            getCacheAgeInMinutes: jest.fn()
        };
        service = new TopOfTheTopsService(twitchClientMock, cacheRepositoryMock);
    });

    it('should return cached stats when cache age is less than 10 minutes and since is not provided', async () => {
        const cachedStats = [
            new TopOfTheTops('1', 'Game 1', 'User 1', 2, 200, 'Title 1', 100, '10m', '2026-07-09T00:00:00Z')
        ];
        cacheRepositoryMock.getCacheAgeInMinutes.mockResolvedValue(5);
        cacheRepositoryMock.getCachedStats.mockResolvedValue(cachedStats);

        const result = await service.getTopOfTheTops();

        expect(result).toEqual(cachedStats);
        expect(cacheRepositoryMock.getCachedStats).toHaveBeenCalled();
        expect(twitchClientMock.getTopGames).not.toHaveBeenCalled();
    });

    it('should return cached stats when cache age is within since parameter limit', async () => {
        const cachedStats = [
            new TopOfTheTops('1', 'Game 1', 'User 1', 2, 200, 'Title 1', 100, '10m', '2026-07-09T00:00:00Z')
        ];
        cacheRepositoryMock.getCacheAgeInMinutes.mockResolvedValue(15);
        cacheRepositoryMock.getCachedStats.mockResolvedValue(cachedStats);

        const result = await service.getTopOfTheTops(1200);

        expect(result).toEqual(cachedStats);
        expect(cacheRepositoryMock.getCachedStats).toHaveBeenCalled();
        expect(twitchClientMock.getTopGames).not.toHaveBeenCalled();
    });

    it('should query Twitch and refresh cache if cache is older than 10 minutes', async () => {
        cacheRepositoryMock.getCacheAgeInMinutes.mockResolvedValue(12);
        twitchClientMock.getTopGames.mockResolvedValue([
            { id: '1', name: 'Game 1' }
        ]);
        twitchClientMock.getTopVideosByGame.mockResolvedValue([
            { id: 'v1', user_id: 'u1', user_name: 'User 1', title: 'Title 1', view_count: 100, duration: '10m', created_at: '2026-07-09T00:00:00Z' },
            { id: 'v2', user_id: 'u1', user_name: 'User 1', title: 'Title 2', view_count: 50, duration: '5m', created_at: '2026-07-09T01:00:00Z' },
            { id: 'v3', user_id: 'u2', user_name: 'User 2', title: 'Title 3', view_count: 30, duration: '8m', created_at: '2026-07-09T02:00:00Z' }
        ]);

        const result = await service.getTopOfTheTops();

        expect(result).toHaveLength(1);
        expect(result[0].getUserName()).toBe('User 1');
        expect(result[0].getTotalVideos()).toBe(2);
        expect(result[0].getTotalViews()).toBe(150);
        expect(cacheRepositoryMock.saveCachedStats).toHaveBeenCalledWith(result);
    });

    it('should query Twitch and refresh cache if since parameter forces update', async () => {
        cacheRepositoryMock.getCacheAgeInMinutes.mockResolvedValue(8);
        twitchClientMock.getTopGames.mockResolvedValue([
            { id: '1', name: 'Game 1' }
        ]);
        twitchClientMock.getTopVideosByGame.mockResolvedValue([
            { id: 'v1', user_id: 'u1', user_name: 'User 1', title: 'Title 1', view_count: 100, duration: '10m', created_at: '2026-07-09T00:00:00Z' }
        ]);

        const result = await service.getTopOfTheTops(300);

        expect(result).toHaveLength(1);
        expect(cacheRepositoryMock.saveCachedStats).toHaveBeenCalledWith(result);
    });

    it('should query Twitch if cache is null', async () => {
        cacheRepositoryMock.getCacheAgeInMinutes.mockResolvedValue(null);
        twitchClientMock.getTopGames.mockResolvedValue([
            { id: '1', name: 'Game 1' }
        ]);
        twitchClientMock.getTopVideosByGame.mockResolvedValue([
            { id: 'v1', user_id: 'u1', user_name: 'User 1', title: 'Title 1', view_count: 100, duration: '10m', created_at: '2026-07-09T00:00:00Z' }
        ]);

        const result = await service.getTopOfTheTops();

        expect(result).toHaveLength(1);
        expect(cacheRepositoryMock.saveCachedStats).toHaveBeenCalled();
    });

    it('should skip game if the most viewed video lacks a user_name', async () => {
        cacheRepositoryMock.getCacheAgeInMinutes.mockResolvedValue(12);
        twitchClientMock.getTopGames.mockResolvedValue([
            { id: '1', name: 'Game 1' }
        ]);
        twitchClientMock.getTopVideosByGame.mockResolvedValue([
            { id: 'v1', user_id: 'u1', user_name: '', title: 'Title 1', view_count: 100, duration: '10m', created_at: '2026-07-09T00:00:00Z' }
        ]);

        const result = await service.getTopOfTheTops();

        expect(result).toHaveLength(0);
        expect(cacheRepositoryMock.saveCachedStats).not.toHaveBeenCalled();
    });
});
