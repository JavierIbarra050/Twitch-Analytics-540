import { TwitchUsersClient } from '../../../../src/Shared/Infrastructure/Twitch/TwitchUsersClient';
import { TwitchHttpClient } from '../../../../src/Shared/Infrastructure/Twitch/TwitchHttpClient';
import { TwitchUserResponse } from '../../../../src/Shared/Infrastructure/Twitch/TwitchApiResponses';

describe("TwitchUsersClient", () => {
    let httpClientMock: jest.Mocked<TwitchHttpClient>;
    let client: TwitchUsersClient;

    beforeEach(() => {
        httpClientMock = {
            get: jest.fn()
        } as unknown as jest.Mocked<TwitchHttpClient>;

        client = new TwitchUsersClient(httpClientMock);
    });

    it("should fetch a single user by id", async () => {
        const mockResponse: TwitchUserResponse = {
            data: [
                {
                    id: "83232866",
                    login: "ibai_",
                    display_name: "Ibai",
                    type: "",
                    broadcaster_type: "partner",
                    description: "Generic streamer description",
                    profile_image_url: "https://example.com/ibai.png",
                    offline_image_url: "https://example.com/ibai-offline.png",
                    view_count: 150000,
                    created_at: "2026-07-08T13:40:00Z"
                }
            ]
        };

        httpClientMock.get.mockResolvedValue(mockResponse);

        const users = await client.fetchByIds([83232866]);

        const expectedParams = new URLSearchParams();
        expectedParams.append('id', '83232866');
        expect(httpClientMock.get).toHaveBeenCalledWith('users', expectedParams);

        expect(users).toEqual(mockResponse.data);
    });

    it("should fetch multiple users by id in a single call", async () => {
        httpClientMock.get.mockResolvedValue({ data: [] });

        await client.fetchByIds(["1", "2", "3"]);

        const expectedParams = new URLSearchParams();
        expectedParams.append('id', '1');
        expectedParams.append('id', '2');
        expectedParams.append('id', '3');
        expect(httpClientMock.get).toHaveBeenCalledWith('users', expectedParams);
    });

    it("should return an empty array when Twitch returns no users", async () => {
        httpClientMock.get.mockResolvedValue({ data: [] });

        const users = await client.fetchByIds(["nonexistent"]);

        expect(users).toEqual([]);
    });
});
