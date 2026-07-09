import axios from 'axios';
import { TwitchTokenResponse } from './TwitchTokenResponse';

export class TwitchHttpClient {
    private readonly clientId = process.env.TWITCH_CLIENT_ID || '';
    private readonly clientSecret = process.env.TWITCH_CLIENT_SECRET || '';
    private accessToken: string | null = null;

    private async getAppAccessToken(): Promise<string> {
        if (this.accessToken) {
            return this.accessToken;
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
        return this.accessToken;
    }

    public async get<T>(url: string, params?: any): Promise<T> {
        const token = await this.getAppAccessToken();
        const response = await axios.get<T>(
            `https://api.twitch.tv/helix/${url}`,
            {
                headers: {
                    'Client-Id': this.clientId,
                    'Authorization': `Bearer ${token}`
                },
                params: params
            }
        );
        return response.data;
    }
}
