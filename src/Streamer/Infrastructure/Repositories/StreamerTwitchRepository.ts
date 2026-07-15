import { IStreamerRepository } from "../../Domain/Repositories/IStreamerRepository";
import { Streamer } from '../../Domain/Entities/Streamer';
import { TwitchUsersClient } from "../../../Shared/Infrastructure/Twitch/TwitchUsersClient";

export class StreamerTwitchRepository implements IStreamerRepository {
    constructor(
        private readonly usersClient: TwitchUsersClient
    ) {}

    async searchStreamerById(id: number): Promise<Streamer | null> {
        const users = await this.usersClient.fetchByIds([id]);

        if (users.length === 0) {
            return null;
        }

        const twitchUser = users[0];

        return new Streamer({
            id: Number(twitchUser.id),
            login: twitchUser.login,
            displayName: twitchUser.display_name,
            type: twitchUser.type,
            broadcasterType: twitchUser.broadcaster_type,
            description: twitchUser.description,
            profileImageUrl: twitchUser.profile_image_url,
            offlineImageUrl: twitchUser.offline_image_url,
            viewCount: twitchUser.view_count,
            createdAt: new Date(twitchUser.created_at)
        });
    }
}
