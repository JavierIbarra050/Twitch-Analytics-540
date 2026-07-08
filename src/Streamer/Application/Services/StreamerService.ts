import { Streamer } from "../../Domain/Entities/Streamer";
import { ITwitchRepository } from "../../Domain/Repositories/ITwitchRepository";

export class StreamerService {
    constructor (
        private readonly twitchRepository: ITwitchRepository,
    ) { }

    async getStreamerById(id: number): Promise<Streamer> {
        const streamer = await this.twitchRepository.searchStreamerById(id);

        if (streamer === null) {
            throw new Error("Streamer with id: " + id + " not found");
        }

        return streamer;
    }
}