import { ITwitchClient, RawStream, UserProfile } from "../../Domain/Repositories/ITwitchClient";
import { TwitchHttpClient } from "../../../../Shared/Infrastructure/Twitch/TwitchHttpClient";
import { TwitchStreamResponse, TwitchUserResponse } from "../../../../Shared/Infrastructure/Twitch/TwitchApiResponses";

export class TwitchClient implements ITwitchClient {
    constructor(
        private readonly httpClient: TwitchHttpClient
    ) {}

    async getRawLiveStreams(limit: number): Promise<RawStream[]> {
        if (limit <= 0) {
            return [];
        }

        const response = await this.httpClient.get<TwitchStreamResponse>(
            'streams',
            { first: limit.toString() }
        );

        return response.data.map(stream => ({
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
