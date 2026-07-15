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
