import { ITwitchClient } from "../../Domain/Repositories/ITwitchClient";
import { TwitchHttpClient } from "../../../Shared/Infrastructure/Twitch/TwitchHttpClient";

export class TwitchClient implements ITwitchClient {
    constructor(private readonly twitchHttpClient: TwitchHttpClient) {}

    async getTopGames(limit: number): Promise<any[]> {
        const response = await this.twitchHttpClient.get<{ data: any[] }>('games/top', { first: limit });
        return response.data || [];
    }

    async getTopVideosByGame(gameId: string, limit: number): Promise<any[]> {
        const response = await this.twitchHttpClient.get<{ data: any[] }>('videos', {
            game_id: gameId,
            period: 'all',
            sort: 'views',
            first: limit
        });
        return response.data || [];
    }
}
