import { IStreamExternalRepository } from "../../Domain/Repositories/IStreamExternalRepository";
import { Stream } from "../../Domain/Entities/Stream";
import { TwitchStreamResponse } from "../../../Shared/Infrastructure/Twitch/TwitchApiResponses";
import { TwitchHttpClient } from "../../../Shared/Infrastructure/Twitch/TwitchHttpClient";

export class StreamTwitchRepository implements IStreamExternalRepository {
    constructor(
        private readonly httpClient: TwitchHttpClient
    ) {}

    async getLiveStreams(): Promise<Stream[]> {
        const response = await this.httpClient.get<TwitchStreamResponse>(
            'streams',
            new URLSearchParams()
        );

        return response.data.map(
            (stream) => new Stream(stream.title, stream.user_name)
        );
    }
}
