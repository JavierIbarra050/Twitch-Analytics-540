"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamerTwitchRepository = void 0;
class StreamerTwitchRepository {
    httpClient;
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    async searchStreamerById(id) {
        const response = await this.httpClient.get('users', { id: id.toString() });
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
exports.StreamerTwitchRepository = StreamerTwitchRepository;
