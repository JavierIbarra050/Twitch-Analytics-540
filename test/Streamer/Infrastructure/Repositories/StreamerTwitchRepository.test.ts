import { StreamerTwitchRepository } from '../../../../src/Streamer/Infrastructure/Repositories/StreamerTwitchRepository';
import { TwitchHttpClient } from '../../../../src/Shared/Infrastructure/Twitch/TwitchHttpClient';
import { TwitchUserResponse } from '../../../../src/Shared/Infrastructure/Twitch/TwitchApiResponses';
import { Streamer } from '../../../../src/Streamer/Domain/Entities/Streamer';

jest.mock('../../../../src/Shared/Infrastructure/Twitch/TwitchHttpClient');

describe("StreamerTwitchRepository", () => {
    let httpClientMock: jest.Mocked<TwitchHttpClient>;
    let repository: StreamerTwitchRepository;

    beforeEach(() => {
        httpClientMock = {
            get: jest.fn()
        } as unknown as jest.Mocked<TwitchHttpClient>;

        repository = new StreamerTwitchRepository(httpClientMock);
    });

    it("should return null when streamer is not found on Twitch", async () => {
        httpClientMock.get.mockResolvedValue({ data: [] });

        const result = await repository.searchStreamerById(123);

        expect(httpClientMock.get).toHaveBeenCalledWith('users', { id: "123" });
        expect(result).toBeNull();
    });

    it("should return Streamer entity when found on Twitch", async () => {
        const mockTwitchResponse: TwitchUserResponse = {
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

        httpClientMock.get.mockResolvedValue(mockTwitchResponse);

        const result = await repository.searchStreamerById(83232866);

        expect(httpClientMock.get).toHaveBeenCalledWith('users', { id: "83232866" });
        expect(result).toEqual(new Streamer(
            83232866,
            "ibai_",
            "Ibai",
            "",
            "partner",
            "Generic streamer description",
            "https://example.com/ibai.png",
            "https://example.com/ibai-offline.png",
            150000,
            new Date("2026-07-08T13:40:00Z")
        ));
    });
});
