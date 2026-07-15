import { TwitchHttpClient } from "./TwitchHttpClient";
import { TwitchUserResponse } from "./TwitchApiResponses";

export class TwitchUsersClient {
    constructor(
        private readonly httpClient: TwitchHttpClient
    ) {}

    async fetchByIds(ids: (string | number)[]): Promise<TwitchUserResponse['data']> {
        const params = new URLSearchParams();
        ids.forEach(id => params.append('id', id.toString()));

        const response = await this.httpClient.get<TwitchUserResponse>('users', params);
        return response.data;
    }
}
