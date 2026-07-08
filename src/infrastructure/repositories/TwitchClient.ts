import axios from 'axios';

interface TwitchTokenResponse {
    access_token: string;
    expires_in: number;
    token_type: string;
}

export class TwitchClient {
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
}