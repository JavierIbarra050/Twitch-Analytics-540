import { Stream } from "../../Domain/Entities/Stream";
import { IStreamExternalRepository } from "../../Domain/Repositories/IStreamExternalRepository";

export class StreamService {
    constructor (
        private readonly streamRepository: IStreamExternalRepository,
    ) { }

    async getLiveStreams(): Promise<Stream[]> {
        return await this.streamRepository.getLiveStreams();
    }
}
