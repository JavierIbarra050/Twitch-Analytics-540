"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwitchRepository = void 0;
const axios_1 = __importDefault(require("axios"));
class TwitchRepository {
    clientId = process.env.TWITCH_CLIENT_ID || '';
    clientSecret = process.env.TWITCH_CLIENT_SECRET || '';
    accessToken = null;
    async getAppAccessToken() {
        if (this.accessToken) {
            return this.accessToken;
        }
        const response = await axios_1.default.post('https://id.twitch.tv/oauth2/token', null, {
            params: {
                client_id: this.clientId,
                client_secret: this.clientSecret,
                grant_type: 'client_credentials'
            }
        });
        this.accessToken = response.data.access_token;
        return this.accessToken;
    }
    async searchStreamerById(id) {
        const token = await this.getAppAccessToken();
        const response = await axios_1.default.get('https://api.twitch.tv/helix/users', {
            headers: {
                'Client-Id': this.clientId,
                'Authorization': `Bearer ${token}`
            },
            params: {
                id: id.toString()
            }
        });
        const users = response.data.data;
        if (users.length === 0) {
            return null;
        }
        const twitchUser = users[0];
        return {
            id: Number(twitchUser.id),
            displayName: twitchUser.display_name,
            type: twitchUser.type,
            breadcasterType: twitchUser.broadcaster_type,
            description: twitchUser.description,
            profileImageUrl: twitchUser.profile_image_url,
            offlineImageUrl: twitchUser.offline_image_url,
            viewCount: twitchUser.view_count,
            createdAt: new Date(twitchUser.created_at)
        };
    }
}
exports.TwitchRepository = TwitchRepository;
