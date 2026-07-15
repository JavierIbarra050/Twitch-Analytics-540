import { Streamer } from "../../Domain/Entities/Streamer";
import { IStreamerRepository } from "../../Domain/Repositories/IStreamerRepository";
import { StreamerNotFoundError } from "../../Domain/Errors/StreamerNotFoundError";

export class StreamerService {
    constructor (
        private readonly twitchRepository: IStreamerRepository,
    ) { }

    async getStreamerById(id: number): Promise<Streamer> {
        const streamer = await this.twitchRepository.searchStreamerById(id);

        if (streamer === null) {
            throw new StreamerNotFoundError(id);
        }

        return streamer;
    }
}