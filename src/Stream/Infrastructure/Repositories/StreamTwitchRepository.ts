import { IStreamExternalRepository } from "../../Domain/Repositories/IStreamExternalRepository";
import { Stream } from "../../Domain/Entities/Stream";
import { TwitchStreamResponse } from "../TwitchResponses/TwitchStreamResponse";
import { TwitchHttpClient } from "../../../Shared/Infrastructure/Twitch/TwitchHttpClient";

export class StreamTwitchRepository implements IStreamExternalRepository {
    constructor(
        private readonly httpClient: TwitchHttpClient
    ) {}

    async getLiveStreams(userIds: number[]): Promise<Stream[]> {
        if (userIds.length === 0) {
            return [];
        }

        const params = new URLSearchParams();
        userIds.forEach(id => params.append('user_id', id.toString()));

        const response = await this.httpClient.get<TwitchStreamResponse>(
            'streams',
            params
        );

        return response.data.map(
            (stream) => new Stream(stream.title, stream.user_name)
        );
    }
}
