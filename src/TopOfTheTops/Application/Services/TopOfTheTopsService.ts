import { ITwitchClient, TwitchGame } from "../../Domain/Repositories/ITwitchClient";
import { IGameCacheRepository } from "../../Domain/Repositories/IGameCacheRepository";
import { TopOfTheTops } from "../../Domain/Entities/TopOfTheTops";
import { Game } from "../../Domain/Entities/Game";
import { Video } from "../../Domain/Entities/Video";

export class TopOfTheTopsService {
    constructor(
        private readonly twitchClient: ITwitchClient,
        private readonly cacheRepository: IGameCacheRepository
    ) {}

    async getTopOfTheTops(since?: number): Promise<TopOfTheTops[]> {
        const cacheAge = await this.cacheRepository.getCacheAgeInMinutes();

        let isCacheValid = false;
        if (cacheAge !== null) {
            if (since !== undefined) {
                isCacheValid = cacheAge <= (since / 60.0);
            } else {
                isCacheValid = cacheAge < 10.0;
            }
        }

        if (isCacheValid) {
            const cached = await this.cacheRepository.getCachedStats();
            if (cached) {
                return cached;
            }
        }

        const topGames = await this.twitchClient.getTopGames(3);
        const gameStats = await Promise.all(topGames.map(game => this.buildGameStats(game)));
        const results = gameStats.filter((stat): stat is TopOfTheTops => stat !== null);

        if (results.length > 0) {
            await this.cacheRepository.saveCachedStats(results);
        }

        return results;
    }

    private async buildGameStats(game: TwitchGame): Promise<TopOfTheTops | null> {
        const videos = await this.twitchClient.getTopVideosByGame(game.id, 40);
        if (videos.length === 0) {
            return null;
        }

        const mostViewedVideo = videos[0];
        const targetUser = mostViewedVideo.user_name;

        if (!targetUser) {
            return null;
        }

        const userVideos = videos.filter(v => v.user_name && v.user_name.toLowerCase() === targetUser.toLowerCase());
        const totalVideosCount = userVideos.length;
        const totalViewsSum = userVideos.reduce((sum, v) => sum + (v.view_count || 0), 0);

        const gameEntity = new Game(game.id, game.name);
        const videoEntity = new Video(
            mostViewedVideo.id,
            mostViewedVideo.user_id,
            mostViewedVideo.user_name,
            mostViewedVideo.title,
            mostViewedVideo.view_count,
            mostViewedVideo.duration,
            mostViewedVideo.created_at
        );

        return new TopOfTheTops(
            gameEntity,
            videoEntity,
            totalVideosCount,
            totalViewsSum
        );
    }
}
