import { Streamer } from "../Entities/Streamer";

export interface IStreamerRepository {
    searchStreamerById(id: number): Promise<Streamer | null>;
}
