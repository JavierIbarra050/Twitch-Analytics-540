import { IStreamerExternalRepository } from "../../Domain/Repositories/IStreamerExternalRepository";
import { TwitchUserResponse } from '../../../Shared/Infrastructure/Twitch/TwitchApiResponses';
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

        return new Streamer(
            Number(twitchUser.id),
            twitchUser.login,
            twitchUser.display_name,
            twitchUser.type,
            twitchUser.broadcaster_type,
            twitchUser.description,
            twitchUser.profile_image_url,
            twitchUser.offline_image_url,
            twitchUser.view_count,
            new Date(twitchUser.created_at)
        );
    }
}
