export interface TwitchGame {
    id: string;
    name: string;
}

export interface TwitchVideo {
    id: string;
    user_id: string;
    user_name: string;
    title: string;
    view_count: number;
    duration: string;
    created_at: string;
}

export interface ITwitchClient {
    getTopGames(limit: number): Promise<TwitchGame[]>;

    getTopVideosByGame(gameId: string, limit: number): Promise<TwitchVideo[]>;
}
