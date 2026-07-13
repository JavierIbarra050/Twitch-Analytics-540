"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopOfTheTopsService = void 0;
const TopOfTheTops_1 = require("../../Domain/Entities/TopOfTheTops");
class TopOfTheTopsService {
    twitchClient;
    cacheRepository;
    constructor(twitchClient, cacheRepository) {
        this.twitchClient = twitchClient;
        this.cacheRepository = cacheRepository;
    }
    async getTopOfTheTops(since) {
        const cacheAge = await this.cacheRepository.getCacheAgeInMinutes();
        let isCacheValid = false;
        if (cacheAge !== null) {
            if (since !== undefined) {
                isCacheValid = cacheAge <= (since / 60.0);
            }
            else {
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
        const results = [];
        for (const game of topGames) {
            const videos = await this.twitchClient.getTopVideosByGame(game.id, 40);
            if (videos.length === 0) {
                continue;
            }
            const mostViewedVideo = videos[0];
            const targetUser = mostViewedVideo.user_name;
            if (!targetUser) {
                continue;
            }
            const userVideos = videos.filter(v => v.user_name && v.user_name.toLowerCase() === targetUser.toLowerCase());
            const totalVideosCount = userVideos.length;
            const totalViewsSum = userVideos.reduce((sum, v) => sum + (v.view_count || 0), 0);
            results.push(new TopOfTheTops_1.TopOfTheTops(game.id, game.name, mostViewedVideo.user_name, totalVideosCount, totalViewsSum, mostViewedVideo.title, mostViewedVideo.view_count, mostViewedVideo.duration, mostViewedVideo.created_at));
        }
        if (results.length > 0) {
            await this.cacheRepository.saveCachedStats(results);
        }
        return results;
    }
}
exports.TopOfTheTopsService = TopOfTheTopsService;
