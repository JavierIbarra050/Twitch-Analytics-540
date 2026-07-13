"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwitchClient = void 0;
class TwitchClient {
    httpClient;
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    async getRawLiveStreams(limit) {
        if (limit <= 0) {
            return [];
        }
        const response = await this.httpClient.get('streams', { first: limit.toString() });
        return response.data.map(stream => ({
            id: stream.id,
            userId: stream.user_id,
            userName: stream.user_name,
            viewerCount: stream.viewer_count,
            title: stream.title
        }));
    }
    async getUsersProfiles(userIds) {
        if (userIds.length === 0) {
            return [];
        }
        const params = new URLSearchParams();
        userIds.forEach(id => params.append('id', id));
        const response = await this.httpClient.get('users', params);
        return response.data.map(user => ({
            id: user.id,
            displayName: user.display_name,
            profileImageUrl: user.profile_image_url
        }));
    }
}
exports.TwitchClient = TwitchClient;
