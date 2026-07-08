import { Streamer } from "../Entities/Streamer";

export interface ITwitchRepository {
    searchStreamerById(id: number): Promise<Streamer | null>
}
