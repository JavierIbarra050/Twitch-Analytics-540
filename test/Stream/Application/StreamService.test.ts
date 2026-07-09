import { StreamService } from "Stream/Application/Services/StreamService";
import { IStreamExternalRepository } from "Stream/Domain/Repositories/IStreamExternalRepository";
import { StreamMother } from "../Mothers/StreamMother";

describe("StreamService", () => {
    let streamRepositoryMock: jest.Mocked<IStreamExternalRepository>;

    beforeEach(() => {
        streamRepositoryMock = {
            getLiveStreams: jest.fn(),
        } as unknown as jest.Mocked<IStreamExternalRepository>;
    });

    it("should return the live streams when they exist", async () => {
        const streamService = new StreamService(streamRepositoryMock);
        const expectedStreams = [
            StreamMother.create({ title: "Stream 1", userName: "Ibai" }),
            StreamMother.create({ title: "Stream 2", userName: "Auronplay" })
        ];

        streamRepositoryMock.getLiveStreams.mockResolvedValue(expectedStreams);

        const streams = await streamService.getLiveStreams();

        expect(streamRepositoryMock.getLiveStreams).toHaveBeenCalledWith();
        expect(streams).toEqual(expectedStreams);
    });

    it("should return an empty array when no streams are live", async () => {
        const streamService = new StreamService(streamRepositoryMock);

        streamRepositoryMock.getLiveStreams.mockResolvedValue([]);

        const streams = await streamService.getLiveStreams();

        expect(streams).toEqual([]);
    });

    it("should propagate error when the repository fails", async () => {
        const streamService = new StreamService(streamRepositoryMock);

        streamRepositoryMock.getLiveStreams.mockRejectedValue(new Error("Twitch Helix API error"));

        await expect(streamService.getLiveStreams()).rejects.toThrow("Twitch Helix API error");
    });
});
