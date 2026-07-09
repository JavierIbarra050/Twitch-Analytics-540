export interface ITwitchClient {
    getTopGames(limit: number): Promise<any[]>;

    getTopVideosByGame(gameId: string, limit: number): Promise<any[]>;
}
