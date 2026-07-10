process.env.TWITCH_CLIENT_ID = 'test-client-id';
process.env.TWITCH_CLIENT_SECRET = 'test-client-secret';

import axios, { AxiosResponse } from 'axios';
import { StreamTwitchRepository } from "Stream/Infrastructure/Repositories/StreamTwitchRepository";
import { TwitchStreamResponse } from "Stream/Infrastructure/TwitchResponses/TwitchStreamResponse";
import { TwitchTokenResponse } from "Shared/Infrastructure/Twitch/TwitchTokenResponse";
import { TwitchHttpClient } from "Shared/Infrastructure/Twitch/TwitchHttpClient";
import { Stream } from "Stream/Domain/Entities/Stream";

jest.mock('axios');
const mockedAxios = jest.mocked(axios);

describe("StreamTwitchRepository", () => {
    let repository: StreamTwitchRepository;
    let httpClient: TwitchHttpClient;

    beforeEach(() => {
        jest.clearAllMocks();
        httpClient = new TwitchHttpClient();
        repository = new StreamTwitchRepository(httpClient);

        const tokenResponse: Partial<AxiosResponse<TwitchTokenResponse>> = {
            data: {
                access_token: "mocked-token",
                expires_in: 3600,
                token_type: "bearer"
            }
        };
        mockedAxios.post.mockResolvedValue(tokenResponse);
    });

    describe("getLiveStreams", () => {
        it("should fetch live streams and map them correctly when streams exist", async () => {
            const twitchStreamMock: TwitchStreamResponse = {
                data: [
                    {
                        id: "12345",
                        user_id: "83232866",
                        user_login: "ibai",
                        user_name: "Ibai",
                        game_id: "509658",
                        game_name: "Just Chatting",
                        type: "live",
                        title: "Charlando un rato",
                        viewer_count: 45000,
                        started_at: "2026-07-09T08:00:00Z",
                        language: "es",
                        thumbnail_url: "https://static-cdn/live.png",
                        tag_ids: [],
                        is_mature: false
                    }
                ]
            };

            const streamResponse: Partial<AxiosResponse<TwitchStreamResponse>> = {
                data: twitchStreamMock
            };

            mockedAxios.get.mockResolvedValue(streamResponse);

            const streams = await repository.getLiveStreams();

            expect(mockedAxios.post).toHaveBeenCalledTimes(1);
            expect(mockedAxios.get).toHaveBeenCalledTimes(1);

            expect(mockedAxios.get).toHaveBeenCalledWith(
                'https://api.twitch.tv/helix/streams',
                {
                    headers: {
                        'Client-Id': 'test-client-id',
                        'Authorization': 'Bearer mocked-token'
                    },
                    params: new URLSearchParams()
                }
            );

            expect(streams.length).toBe(1);
            expect(streams[0]).toBeInstanceOf(Stream);
            expect(streams[0].getTitle()).toBe("Charlando un rato");
            expect(streams[0].getUserName()).toBe("Ibai");
        });

        it("should return empty array when no streams are live", async () => {
            const streamResponse: Partial<AxiosResponse<TwitchStreamResponse>> = {
                data: { data: [] }
            };

            mockedAxios.get.mockResolvedValue(streamResponse);

            const streams = await repository.getLiveStreams();

            expect(streams).toEqual([]);
        });

        it("should propagate error when twitch api for streams fails", async () => {
            mockedAxios.get.mockRejectedValue(new Error("Twitch Helix API error"));

            await expect(repository.getLiveStreams()).rejects.toThrow("Twitch Helix API error");
        });
    });
});
