import { IGameCacheRepository } from "../../Domain/Repositories/IGameCacheRepository";
import { TopOfTheTops } from "../../Domain/Entities/TopOfTheTops";
import { getDatabase } from "../../../Shared/Infrastructure/Database/database";

export class GameCacheRepository implements IGameCacheRepository {
    async getCachedStats(): Promise<TopOfTheTops[] | null> {
        const db = await getDatabase();
        const rows = await db.all<{
            game_id: string;
            game_name: string;
            user_name: string;
            total_videos: string;
            total_views: string;
            most_viewed_title: string;
            most_viewed_views: string;
            most_viewed_duration: string;
            most_viewed_created_at: string;
        }>("SELECT * FROM game_cache");
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
        if (db.type === 'mysql') {
            await db.run("START TRANSACTION");
        } else {
            await db.run("BEGIN TRANSACTION");
        }
        try {
            await db.run("DELETE FROM game_cache");
            
            for (const stat of stats) {
                await db.run(
                    `INSERT INTO game_cache (
                        game_id, game_name, user_name, total_videos, total_views,
                        most_viewed_title, most_viewed_views, most_viewed_duration, most_viewed_created_at, updated_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
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
        const row = await db.get<{ last_update: string }>("SELECT MAX(updated_at) as last_update FROM game_cache");
        if (!row || !row.last_update) {
            return null;
        }
        
        if (db.type === 'mysql') {
            const diffRow = await db.get<{ diff_minutes: number }>("SELECT TIMESTAMPDIFF(MINUTE, ?, NOW()) AS diff_minutes", [row.last_update]);
            return diffRow ? Math.max(0, diffRow.diff_minutes) : null;
        } else {
            const diffRow = await db.get<{ diff_minutes: number }>(
                "SELECT (strftime('%s', 'now') - strftime('%s', ?)) / 60.0 AS diff_minutes",
                [row.last_update]
            );
            return diffRow ? Math.max(0, diffRow.diff_minutes) : null;
        }
    }
}
