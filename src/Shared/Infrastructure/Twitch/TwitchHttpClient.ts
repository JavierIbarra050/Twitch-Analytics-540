import axios from 'axios';
import { TwitchTokenResponse } from './TwitchTokenResponse';

const TOKEN_EXPIRATION_BUFFER_MS = 60 * 1000; // Refresh token 60s before actual expiry

export class TwitchHttpClient {
    private readonly clientId = process.env.TWITCH_CLIENT_ID || '';
    private readonly clientSecret = process.env.TWITCH_CLIENT_SECRET || '';
    private accessToken: string | null = null;
    private expiresAt: number = 0;

    private async getAppAccessToken(): Promise<string> {
        const isTokenValid = this.accessToken && Date.now() < this.expiresAt - TOKEN_EXPIRATION_BUFFER_MS;
        if (isTokenValid) {
            return this.accessToken!;
        }

        const response = await axios.post<TwitchTokenResponse>(
            'https://id.twitch.tv/oauth2/token',
            null,
            {
                params: {
                    client_id: this.clientId,
                    client_secret: this.clientSecret,
                    grant_type: 'client_credentials'
                }
            }
        );

        this.accessToken = response.data.access_token;
        this.expiresAt = Date.now() + response.data.expires_in * 1000;
        return this.accessToken;
    }

    private invalidateToken(): void {
        this.accessToken = null;
        this.expiresAt = 0;
    }

    private async executeGet<T>(url: string, params?: any): Promise<T> {
        const token = await this.getAppAccessToken();
        const response = await axios.get<T>(
            `https://api.twitch.tv/helix/${url}`,
            {
                headers: {
                    'Client-Id': this.clientId,
                    'Authorization': `Bearer ${token}`
                },
                params
            }
        );
        return response.data;
    }

    public async get<T>(url: string, params?: any): Promise<T> {
        try {
            return await this.executeGet<T>(url, params);
        } catch (error: any) {
            // If Twitch returns 401, the token may have been revoked externally.
            // Invalidate the cached token and retry once with a fresh one.
            if (error?.response?.status === 401) {
                this.invalidateToken();
                return this.executeGet<T>(url, params);
            }
            throw error;
        }
    }
}
