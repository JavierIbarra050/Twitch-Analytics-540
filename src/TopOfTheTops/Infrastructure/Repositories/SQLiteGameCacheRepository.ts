import { IGameCacheRepository } from "../../Domain/Repositories/IGameCacheRepository";
import { TopOfTheTops } from "../../Domain/Entities/TopOfTheTops";
import { getDatabase } from "../../../Shared/Infrastructure/Database/database";

export class SQLiteGameCacheRepository implements IGameCacheRepository {
    async getCachedStats(): Promise<TopOfTheTops[] | null> {
        const db = await getDatabase();
        const rows = await db.all("SELECT * FROM game_cache");
        if (rows.length === 0) {
            return null;
        }
        return rows.map(row => new TopOfTheTops(
            row.game_id,
            row.game_name,
            row.user_name,
            Number(row.total_videos),
            Number(row.total_views),
            row.most_viewed_title,
            Number(row.most_viewed_views),
            row.most_viewed_duration,
            row.most_viewed_created_at
        ));
    }

    async saveCachedStats(stats: TopOfTheTops[]): Promise<void> {
        const db = await getDatabase();
        await db.run("BEGIN TRANSACTION");
        try {
            await db.run("DELETE FROM game_cache");
            
            for (const stat of stats) {
                await db.run(
                    `INSERT INTO game_cache (
                        game_id, game_name, user_name, total_videos, total_views,
                        most_viewed_title, most_viewed_views, most_viewed_duration, most_viewed_created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
                    [
                        stat.getGameId(),
                        stat.getGameName(),
                        stat.getUserName(),
                        stat.getTotalVideos(),
                        stat.getTotalViews(),
                        stat.getMostViewedTitle(),
                        stat.getMostViewedViews(),
                        stat.getMostViewedDuration(),
                        stat.getMostViewedCreatedAt()
                    ]
                );
            }
            await db.run("COMMIT");
        } catch (error) {
            await db.run("ROLLBACK");
            throw error;
        }
    }

    async getCacheAgeInMinutes(): Promise<number | null> {
        const db = await getDatabase();
        const row = await db.get("SELECT MAX(updated_at) as last_update FROM game_cache");
        if (!row || !row.last_update) {
            return null;
        }
        
        const diffRow = await db.get(
            "SELECT (strftime('%s', 'now') - strftime('%s', ?)) / 60.0 AS diff_minutes",
            [row.last_update]
        );
        
        return diffRow ? Math.max(0, parseFloat(diffRow.diff_minutes)) : null;
    }
}
