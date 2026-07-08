import axios, { AxiosResponse } from 'axios';
import { TwitchRepository } from "Streamer/Infrastructure/Repositories/TwitchRepository";
import { TwitchUserResponse } from "Streamer/Infrastructure/TwitchResponses/TwitchUserReponses";
import { TwitchTokenResponse } from "Streamer/Infrastructure/TwitchResponses/TwitchTokenReponse";

jest.mock('axios');
const mockedAxios = jest.mocked(axios);

describe("TwitchRepository", () => {
    let repository: TwitchRepository;

    beforeEach(() => {
        jest.clearAllMocks();
        repository = new TwitchRepository();
        
        const tokenResponse: Partial<AxiosResponse<TwitchTokenResponse>> = {
            data: {
                access_token: "mocked-token",
                expires_in: 3600,
                token_type: "bearer"
            }
        };
        mockedAxios.post.mockResolvedValue(tokenResponse);
    });

    it("should fetch streamer details and map them correctly when user exists", async () => {
        const twitchUserMock: TwitchUserResponse = {
            data: [{
                id: "83232866",
                login: "ibai",
                display_name: "Ibai",
                type: "",
                broadcaster_type: "partner",
                description: "Canal de Ibai",
                profile_image_url: "https://static-cdn/ibai.png",
                offline_image_url: "https://static-cdn/offline.png",
                view_count: 150000,
                created_at: "2014-01-28T19:35:12Z"
            }]
        };

        const userResponse: Partial<AxiosResponse<TwitchUserResponse>> = {
            data: twitchUserMock
        };

        mockedAxios.get.mockResolvedValue(userResponse);

        const streamer = await repository.searchStreamerById(83232866);

        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        expect(mockedAxios.get).toHaveBeenCalledWith(
            'https://api.twitch.tv/helix/users',
            {
                headers: {
                    'Client-Id': '',
                    'Authorization': 'Bearer mocked-token'
                },
                params: {
                    id: "83232866"
                }
            }
        );

        expect(streamer).toEqual({
            id: 83232866,
            displayName: "Ibai",
            type: "",
            breadcasterType: "partner",
            description: "Canal de Ibai",
            profileImageUrl: "https://static-cdn/ibai.png",
            offlineImageUrl: "https://static-cdn/offline.png",
            viewCount: 150000,
            createdAt: new Date("2014-01-28T19:35:12Z")
        });
    });

    it("should return null if twitch api returns empty data array", async () => {
        const userResponse: Partial<AxiosResponse<TwitchUserResponse>> = {
            data: { data: [] }
        };

        mockedAxios.get.mockResolvedValue(userResponse);

        const streamer = await repository.searchStreamerById(999999);

        expect(streamer).toBeNull();
    });

    it("should cache the access token and not request it again on subsequent calls", async () => {
        const twitchUserMock: TwitchUserResponse = {
            data: [{
                id: "83232866",
                login: "ibai",
                display_name: "Ibai",
                type: "",
                broadcaster_type: "partner",
                description: "Canal de Ibai",
                profile_image_url: "",
                offline_image_url: "",
                view_count: 100,
                created_at: "2014-01-28T19:35:12Z"
            }]
        };

        const userResponse: Partial<AxiosResponse<TwitchUserResponse>> = {
            data: twitchUserMock
        };

        mockedAxios.get.mockResolvedValue(userResponse);

        await repository.searchStreamerById(83232866);
        await repository.searchStreamerById(83232866);

        expect(mockedAxios.post).toHaveBeenCalledTimes(1);
        expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    it("should propagate error when twitch api fails", async () => {
        mockedAxios.get.mockRejectedValue(new Error("Twitch Helix API error"));

        await expect(repository.searchStreamerById(83232866)).rejects.toThrow("Twitch Helix API error");
    });
});
