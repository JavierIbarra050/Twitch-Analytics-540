import { StreamerService } from "Streamer/Application/Services/StreamerService";
import { IStreamerRepository } from "Streamer/Domain/Repositories/IStreamerRepository";
import { StreamerMother } from "../Mothers/StreamerMother";
import { StreamerNotFoundError } from "Streamer/Domain/Errors/StreamerNotFoundError";

describe("StreamerService", () => {
    let twitchRepositoryMock: jest.Mocked<IStreamerRepository>;

    beforeEach(() => {
        twitchRepositoryMock = {
            searchStreamerById: jest.fn(),
        } as unknown as jest.Mocked<IStreamerRepository>;
    });

    it("should return the streamer when it is found", async () => {
        const streamerService = new StreamerService(twitchRepositoryMock);
        const expectedStreamer = StreamerMother.create();
        
        twitchRepositoryMock.searchStreamerById.mockResolvedValue(expectedStreamer);

        const streamer = await streamerService.getStreamerById(expectedStreamer.getId());

        expect(streamer).toEqual(expectedStreamer);
    });

    it("should throw a StreamerNotFoundError when streamer is not found", async () => {
        const streamerService = new StreamerService(twitchRepositoryMock);

        twitchRepositoryMock.searchStreamerById.mockResolvedValue(null);

        const promise = streamerService.getStreamerById(1234567);

        await expect(promise).rejects.toBeInstanceOf(StreamerNotFoundError);
        await expect(promise).rejects.toThrow("Streamer with id: 1234567 not found");
    });
});