import { IStreamerExternalRepository } from "../../Domain/Repositories/IStreamerExternalRepository";
import { TwitchUserResponse } from '../TwitchResponses/TwitchUserReponses';
import { Streamer } from '../../Domain/Entities/Streamer';
import { TwitchHttpClient } from '../../../Shared/Infrastructure/Twitch/TwitchHttpClient';

export class StreamerTwitchRepository implements IStreamerExternalRepository {
    constructor(
        private readonly httpClient: TwitchHttpClient
    ) {}

    async searchStreamerById(id: number): Promise<Streamer | null> {
        const response = await this.httpClient.get<TwitchUserResponse>(
            'users',
            { id: id.toString() }
        );
        
        const users = response.data;

        if (users.length === 0) {
            return null;
        }

        const twitchUser = users[0];

        return {
            id: Number(twitchUser.id),
            displayName: twitchUser.display_name,
            type: twitchUser.type,
            broadcasterType: twitchUser.broadcaster_type,
            description: twitchUser.description,
            profileImageUrl: twitchUser.profile_image_url,
            offlineImageUrl: twitchUser.offline_image_url,
            viewCount: twitchUser.view_count,
            createdAt: new Date(twitchUser.created_at)
        };
    }
}
