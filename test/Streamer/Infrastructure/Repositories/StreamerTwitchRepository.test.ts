import { StreamerTwitchRepository } from '../../../../src/Streamer/Infrastructure/Repositories/StreamerTwitchRepository';
import { TwitchUsersClient } from '../../../../src/Shared/Infrastructure/Twitch/TwitchUsersClient';
import { TwitchUserResponse } from '../../../../src/Shared/Infrastructure/Twitch/TwitchApiResponses';
import { Streamer } from '../../../../src/Streamer/Domain/Entities/Streamer';

describe("StreamerTwitchRepository", () => {
    let usersClientMock: jest.Mocked<TwitchUsersClient>;
    let repository: StreamerTwitchRepository;

    beforeEach(() => {
        usersClientMock = {
            fetchByIds: jest.fn()
        } as unknown as jest.Mocked<TwitchUsersClient>;

        repository = new StreamerTwitchRepository(usersClientMock);
    });

    it("should return null when streamer is not found on Twitch", async () => {
        usersClientMock.fetchByIds.mockResolvedValue([]);

        const result = await repository.searchStreamerById(123);

        expect(usersClientMock.fetchByIds).toHaveBeenCalledWith([123]);
        expect(result).toBeNull();
    });

    it("should return Streamer entity when found on Twitch", async () => {
        const mockTwitchResponse: TwitchUserResponse['data'] = [
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
        ];

        usersClientMock.fetchByIds.mockResolvedValue(mockTwitchResponse);

        const result = await repository.searchStreamerById(83232866);

        expect(usersClientMock.fetchByIds).toHaveBeenCalledWith([83232866]);
        expect(result).toEqual(new Streamer({
            id: 83232866,
            login: "ibai_",
            displayName: "Ibai",
            type: "",
            broadcasterType: "partner",
            description: "Generic streamer description",
            profileImageUrl: "https://example.com/ibai.png",
            offlineImageUrl: "https://example.com/ibai-offline.png",
            viewCount: 150000,
            createdAt: new Date("2026-07-08T13:40:00Z")
        }));
    });
});
