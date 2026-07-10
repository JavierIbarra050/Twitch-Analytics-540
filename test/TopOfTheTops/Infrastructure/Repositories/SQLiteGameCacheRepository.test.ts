import { SQLiteGameCacheRepository } from '../../../../src/TopOfTheTops/Infrastructure/Repositories/SQLiteGameCacheRepository';
import { TopOfTheTops } from '../../../../src/TopOfTheTops/Domain/Entities/TopOfTheTops';
import * as database from '../../../../src/Shared/Infrastructure/Database/database';

jest.mock('../../../../src/Shared/Infrastructure/Database/database');

describe('SQLiteGameCacheRepository', () => {
    let repository: SQLiteGameCacheRepository;
    let dbMock: any;

    beforeEach(() => {
        repository = new SQLiteGameCacheRepository();
        dbMock = {
            all: jest.fn(),
            run: jest.fn(),
            get: jest.fn()
        };
        jest.spyOn(database, 'getDatabase').mockResolvedValue(dbMock);
    });

    it('should return null when cache is empty', async () => {
        dbMock.all.mockResolvedValue([]);

        const result = await repository.getCachedStats();

        expect(dbMock.all).toHaveBeenCalledWith("SELECT * FROM game_cache");
        expect(result).toBeNull();
    });

    it('should return mapped entities when cache is not empty', async () => {
        const rows = [{
            game_id: '509658',
            game_name: 'Just Chatting',
            user_name: 'LCK',
            total_videos: '4',
            total_views: '1000000',
            most_viewed_title: 'Title',
            most_viewed_views: '50000',
            most_viewed_duration: '1h',
            most_viewed_created_at: '2026-07-09T00:00:00Z'
        }];
        dbMock.all.mockResolvedValue(rows);

        const result = await repository.getCachedStats();

        expect(result).toBeInstanceOf(Array);
        expect(result![0]).toBeInstanceOf(TopOfTheTops);
        expect(result![0].getGameId()).toBe('509658');
        expect(result![0].getTotalVideos()).toBe(4);
        expect(result![0].getTotalViews()).toBe(1000000);
        expect(result![0].getMostViewedViews()).toBe(50000);
    });

    it('should delete previous cache and insert new stats inside a transaction', async () => {
        const stat = new TopOfTheTops(
            '509658', 'Just Chatting', 'LCK', 4, 1000000,
            'Title', 50000, '1h', '2026-07-09T00:00:00Z'
        );

        await repository.saveCachedStats([stat]);

        expect(dbMock.run).toHaveBeenNthCalledWith(1, "BEGIN TRANSACTION");
        expect(dbMock.run).toHaveBeenNthCalledWith(2, "DELETE FROM game_cache");
        expect(dbMock.run).toHaveBeenNthCalledWith(3, expect.stringContaining("INSERT INTO game_cache"), [
            '509658', 'Just Chatting', 'LCK', 4, 1000000,
            'Title', 50000, '1h', '2026-07-09T00:00:00Z'
        ]);
        expect(dbMock.run).toHaveBeenNthCalledWith(4, "COMMIT");
    });

    it('should rollback transaction and rethrow error when database operations fail', async () => {
        const stat = new TopOfTheTops(
            '509658', 'Just Chatting', 'LCK', 4, 1000000,
            'Title', 50000, '1h', '2026-07-09T00:00:00Z'
        );

        dbMock.run.mockImplementation(async (sql: string) => {
            if (sql.includes("INSERT INTO game_cache")) {
                throw new Error("Disk Full");
            }
        });

        await expect(repository.saveCachedStats([stat])).rejects.toThrow("Disk Full");

        expect(dbMock.run).toHaveBeenNthCalledWith(1, "BEGIN TRANSACTION");
        expect(dbMock.run).toHaveBeenNthCalledWith(2, "DELETE FROM game_cache");
        expect(dbMock.run).toHaveBeenNthCalledWith(4, "ROLLBACK");
        expect(dbMock.run).not.toHaveBeenCalledWith("COMMIT");
    });

    it('should return null if there is no cache update record', async () => {
        dbMock.get.mockResolvedValue(undefined);

        const age = await repository.getCacheAgeInMinutes();

        expect(age).toBeNull();
    });

    it('should return cache age in minutes from database query', async () => {
        dbMock.get.mockResolvedValueOnce({ last_update: '2026-07-09T10:00:00Z' });
        dbMock.get.mockResolvedValueOnce({ diff_minutes: '15.5' });

        const age = await repository.getCacheAgeInMinutes();

        expect(dbMock.get).toHaveBeenNthCalledWith(2, expect.stringContaining("strftime"), ['2026-07-09T10:00:00Z']);
        expect(age).toBe(15.5);
    });
});
