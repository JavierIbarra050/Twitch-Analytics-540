"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwitchClient = void 0;
class TwitchClient {
    twitchHttpClient;
    constructor(twitchHttpClient) {
        this.twitchHttpClient = twitchHttpClient;
    }
    async getTopGames(limit) {
        const response = await this.twitchHttpClient.get('games/top', { first: limit });
        return response.data || [];
    }
    async getTopVideosByGame(gameId, limit) {
        const response = await this.twitchHttpClient.get('videos', {
            game_id: gameId,
            period: 'all',
            sort: 'views',
            first: limit
        });
        return response.data || [];
    }
}
exports.TwitchClient = TwitchClient;
