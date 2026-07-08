import { StreamerService } from "Streamer/Application/Services/StreamerService";
import { TwitchRepository } from "Streamer/Infrastructure/Repositories/TwitchRepository";
import { StreamerMother } from "../Mothers/StreamerMother";

describe("StreamerService", () => {
    let twitchRepositoryMock: jest.Mocked<TwitchRepository>;

    beforeEach(() => {
        twitchRepositoryMock = {
            searchStreamerById: jest.fn(),
        } as unknown as jest.Mocked<TwitchRepository>;
    });

    it("should return the streamer when it is found", async () => {
        const streamerService = new StreamerService(twitchRepositoryMock);
        const expectedStreamer = StreamerMother.create();
        
        twitchRepositoryMock.searchStreamerById.mockResolvedValue(expectedStreamer);

        const streamer = await streamerService.getStreamerById(expectedStreamer.id);

        expect(streamer).toEqual(expectedStreamer);
    });

    it("should throw an error when streamer is not found", async () => {
        const streamerService = new StreamerService(twitchRepositoryMock);
        
        twitchRepositoryMock.searchStreamerById.mockResolvedValue(null);

        await expect(streamerService.getStreamerById(1234567)).rejects.toThrow(
            "Streamer with id: 1234567 not found"
        );
    });
});