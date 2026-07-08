import { Streamer } from "domain/entities/Streamer";
import { ITwitchRepository } from "domain/interfaces/twitchInterfaces/ITwitchRepository";

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