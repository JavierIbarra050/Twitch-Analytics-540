import { Streamer } from "../../Domain/Entities/Streamer";
import { IStreamerExternalRepository } from "../../Domain/Repositories/IStreamerExternalRepository";
import { StreamerNotFoundError } from "../../Domain/Errors/StreamerNotFoundError";

export class StreamerService {
    constructor (
        private readonly twitchRepository: IStreamerExternalRepository,
    ) { }

    async getStreamerById(id: number): Promise<Streamer> {
        const streamer = await this.twitchRepository.searchStreamerById(id);

        if (streamer === null) {
            throw new StreamerNotFoundError(id);
        }

        return streamer;
    }
}