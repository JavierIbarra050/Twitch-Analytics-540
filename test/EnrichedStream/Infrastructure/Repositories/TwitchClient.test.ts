process.env.TWITCH_CLIENT_ID = 'test-client-id';
process.env.TWITCH_CLIENT_SECRET = 'test-client-secret';

import axios, { AxiosResponse } from 'axios';
import { TwitchClient } from "EnrichedStream/Infrastructure/Repositories/TwitchClient";
import { TwitchHttpClient } from "Shared/Infrastructure/Twitch/TwitchHttpClient";
import { TwitchTokenResponse } from "Shared/Infrastructure/Twitch/TwitchTokenResponse";
import { TwitchStreamResponse, TwitchUserResponse } from "Shared/Infrastructure/Twitch/TwitchApiResponses";

jest.mock('axios');
const mockedAxios = jest.mocked(axios);

describe("TwitchClient", () => {
    let client: TwitchClient;
    let httpClient: TwitchHttpClient;

    beforeEach(() => {
        jest.clearAllMocks();
        httpClient = new TwitchHttpClient({
            port: 3000,
            twitchClientId: 'test-client-id',
            twitchClientSecret: 'test-client-secret'
        } as any);
        client = new TwitchClient(httpClient);

        const tokenResponse: Partial<AxiosResponse<TwitchTokenResponse>> = {
            data: {
                access_token: "mocked-token",
                expires_in: 3600,
                token_type: "bearer"
            }
        };
        mockedAxios.post.mockResolvedValue(tokenResponse);
    });

    describe("getRawLiveStreams", () => {
        it("should return empty array if limit is less than or equal to 0", async () => {
            const streams = await client.getRawLiveStreams(0);
            expect(streams).toEqual([]);
            expect(mockedAxios.get).not.toHaveBeenCalled();
        });

        it("should fetch raw live streams and map them correctly", async () => {
            const twitchStreamMock: TwitchStreamResponse = {
                data: [
                    {
                        id: "987654321",
                        user_id: "111111111",
                        user_login: "topstreamer1",
                        user_name: "TopStreamer1",
                        game_id: "509658",
                        game_name: "Just Chatting",
                        type: "live",
                        title: "Epic Gaming Session",
                        viewer_count: 34567,
                        started_at: "2026-07-09T08:00:00Z",
                        language: "en",
                        thumbnail_url: "https://static-cdn.png",
                        tag_ids: [],
                        is_mature: false
                    }
                ]
            };

            mockedAxios.get.mockResolvedValue({ data: twitchStreamMock });

            const streams = await client.getRawLiveStreams(1);

            expect(mockedAxios.get).toHaveBeenCalledWith(
                'https://api.twitch.tv/helix/streams',
                {
                    headers: {
                        'Client-Id': 'test-client-id',
                        'Authorization': 'Bearer mocked-token'
                    },
                    params: { first: "1" }
                }
            );

            expect(streams.length).toBe(1);
            expect(streams[0]).toEqual({
                id: "987654321",
                userId: "111111111",
                userName: "TopStreamer1",
                viewerCount: 34567,
                title: "Epic Gaming Session"
            });
        });
    });

    describe("getUsersProfiles", () => {
        it("should return empty array if userIds is empty", async () => {
            const profiles = await client.getUsersProfiles([]);
            expect(profiles).toEqual([]);
            expect(mockedAxios.get).not.toHaveBeenCalled();
        });

        it("should fetch user profiles in batch and map them correctly", async () => {
            const twitchUserMock: TwitchUserResponse = {
                data: [
                    {
                        id: "111111111",
                        login: "topstreamer1",
                        display_name: "TopStreamer1",
                        type: "",
                        broadcaster_type: "partner",
                        description: "Epic channel",
                        profile_image_url: "https://static-cdn/image.png",
                        offline_image_url: "",
                        view_count: 500,
                        created_at: "2020-01-01T00:00:00Z"
                    }
                ]
            };

            mockedAxios.get.mockResolvedValue({ data: twitchUserMock });

            const profiles = await client.getUsersProfiles(["111111111"]);

            const expectedParams = new URLSearchParams();
            expectedParams.append('id', '111111111');

            expect(mockedAxios.get).toHaveBeenCalledWith(
                'https://api.twitch.tv/helix/users',
                {
                    headers: {
                        'Client-Id': 'test-client-id',
                        'Authorization': 'Bearer mocked-token'
                    },
                    params: expectedParams
                }
            );

            expect(profiles.length).toBe(1);
            expect(profiles[0]).toEqual({
                id: "111111111",
                displayName: "TopStreamer1",
                profileImageUrl: "https://static-cdn/image.png"
            });
        });
    });
});
