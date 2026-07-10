import { ITwitchClient, TwitchGame, TwitchVideo } from "../../Domain/Repositories/ITwitchClient";
import { TwitchHttpClient } from "../../../Shared/Infrastructure/Twitch/TwitchHttpClient";

export class TwitchClient implements ITwitchClient {
    constructor(private readonly twitchHttpClient: TwitchHttpClient) {}

    async getTopGames(limit: number): Promise<TwitchGame[]> {
        const response = await this.twitchHttpClient.get<{ data: TwitchGame[] }>('games/top', { first: limit });
        return response.data || [];
    }

    async getTopVideosByGame(gameId: string, limit: number): Promise<TwitchVideo[]> {
        const response = await this.twitchHttpClient.get<{ data: TwitchVideo[] }>('videos', {
            game_id: gameId,
            period: 'all',
            sort: 'views',
            first: limit
        });
        return response.data || [];
    }
}
