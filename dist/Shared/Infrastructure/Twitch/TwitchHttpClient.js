"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwitchHttpClient = void 0;
const axios_1 = __importDefault(require("axios"));
const TOKEN_EXPIRATION_BUFFER_MS = 60 * 1000;
class TwitchHttpClient {
    clientId;
    clientSecret;
    accessToken = null;
    expiresAt = 0;
    constructor(config) {
        this.clientId = config.twitchClientId;
        this.clientSecret = config.twitchClientSecret;
    }
    async getAppAccessToken() {
        const isTokenValid = this.accessToken && Date.now() < this.expiresAt - TOKEN_EXPIRATION_BUFFER_MS;
        if (isTokenValid) {
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
        this.expiresAt = Date.now() + response.data.expires_in * 1000;
        return this.accessToken;
    }
    invalidateToken() {
        this.accessToken = null;
        this.expiresAt = 0;
    }
    async executeGet(url, params) {
        const token = await this.getAppAccessToken();
        const response = await axios_1.default.get(`https://api.twitch.tv/helix/${url}`, {
            headers: {
                'Client-Id': this.clientId,
                'Authorization': `Bearer ${token}`
            },
            params
        });
        return response.data;
    }
    async get(url, params) {
        try {
            return await this.executeGet(url, params);
        }
        catch (error) {
            if (error?.response?.status === 401) {
                this.invalidateToken();
                return this.executeGet(url, params);
            }
            throw error;
        }
    }
}
exports.TwitchHttpClient = TwitchHttpClient;
