import axios from 'axios';

import { ITwitchRepository } from "../../Domain/Repositories/ITwitchRepository";
import { TwitchUserResponse } from '../TwitchResponses/TwitchUserReponses';
import { TwitchTokenResponse } from "../TwitchResponses/TwitchTokenReponse";
import { Streamer } from '../../Domain/Entities/Streamer';

export class TwitchRepository implements ITwitchRepository {
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
    
    async searchStreamerById(id: number): Promise<Streamer | null> {
        const token = await this.getAppAccessToken();
    
        const response = await axios.get<TwitchUserResponse>(
            'https://api.twitch.tv/helix/users',
            {
            headers: {
                'Client-Id': this.clientId,
                'Authorization': `Bearer ${token}`
            },
            params: {
                id: id.toString()
            }
            }
        );
        
        const users = response.data.data;

        if (users.length === 0) {
            return null;
        }

        const twitchUser = users[0];

        return new Streamer(
            Number(twitchUser.id),
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
