import { IStreamRepository, RawStream, UserProfile } from "../../Domain/Repositories/IStreamRepository";
import { Stream } from "../../Domain/Entities/Stream";
import { TwitchStreamResponse, TwitchUserResponse } from "../../../Shared/Infrastructure/Twitch/TwitchApiResponses";
import { TwitchHttpClient } from "../../../Shared/Infrastructure/Twitch/TwitchHttpClient";

export class StreamTwitchRepository implements IStreamRepository {
    constructor(
        private readonly httpClient: TwitchHttpClient
    ) {}

    private async fetchStreams(params: URLSearchParams | Record<string, string>): Promise<TwitchStreamResponse['data']> {
        const response = await this.httpClient.get<TwitchStreamResponse>('streams', params);
        return response.data;
    }

    async getLiveStreams(): Promise<Stream[]> {
        const streams = await this.fetchStreams(new URLSearchParams());

        return streams.map(
            (stream) => new Stream(stream.title, stream.user_name)
        );
    }

    async getRawLiveStreams(limit: number): Promise<RawStream[]> {
        if (limit <= 0) {
            return [];
        }

        const streams = await this.fetchStreams({ first: limit.toString() });

        return streams.map(stream => ({
            id: stream.id,
            userId: stream.user_id,
            userName: stream.user_name,
            viewerCount: stream.viewer_count,
            title: stream.title
        }));
    }

    async getUsersProfiles(userIds: string[]): Promise<UserProfile[]> {
        if (userIds.length === 0) {
            return [];
        }

        const params = new URLSearchParams();
        userIds.forEach(id => params.append('id', id));

        const response = await this.httpClient.get<TwitchUserResponse>(
            'users',
            params
        );

        return response.data.map(user => ({
            id: user.id,
            displayName: user.display_name,
            profileImageUrl: user.profile_image_url
        }));
    }
}
