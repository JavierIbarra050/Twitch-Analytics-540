import { Streamer } from "../Entities/Streamer";

export interface IStreamerExternalRepository {
    searchStreamerById(id: number): Promise<Streamer | null>;
}
