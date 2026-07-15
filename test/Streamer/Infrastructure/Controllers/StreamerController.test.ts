import { Request, Response } from 'express';
import { StreamerController } from "Streamer/Infrastructure/Controllers/StreamerController";
import { StreamerService } from "Streamer/Application/Services/StreamerService";
import { StreamerMother } from "../../Mothers/StreamerMother";
import { TwitchUnauthorizedError } from "Shared/Infrastructure/Twitch/TwitchUnauthorizedError";
import { StreamerNotFoundError } from "Streamer/Domain/Errors/StreamerNotFoundError";

describe("StreamerController", () => {
    let streamerServiceMock: jest.Mocked<StreamerService>;
    let streamerController: StreamerController;
    let reqMock: Partial<Request>;
    let resMock: Partial<Response>;
    let nextMock: jest.Mock;

    beforeEach(() => {
        streamerServiceMock = {
            getStreamerById: jest.fn(),
        } as unknown as jest.Mocked<StreamerService>;

        streamerController = new StreamerController(streamerServiceMock);

        reqMock = {
            query: {}
        };

        resMock = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };

        nextMock = jest.fn();
    });

    it("should return streamer details and 200 status when streamer is found", async () => {
        const expectedStreamer = StreamerMother.create({
            id: 83232866,
            login: "ibai_",
            displayName: "Ibai",
            createdAt: new Date("2026-07-08T13:40:00Z")
        });

        streamerServiceMock.getStreamerById.mockResolvedValue(expectedStreamer);
        reqMock.query = { id: "83232866" };

        await streamerController.getStreamerById(reqMock as Request, resMock as Response, nextMock);

        expect(streamerServiceMock.getStreamerById).toHaveBeenCalledWith(83232866);
        expect(resMock.status).toHaveBeenCalledWith(200);
        expect(resMock.json).toHaveBeenCalledWith({
            id: "83232866",
            login: "ibai_",
            display_name: "Ibai",
            type: expectedStreamer.getType(),
            broadcaster_type: expectedStreamer.getBroadcasterType(),
            description: expectedStreamer.getDescription(),
            profile_image_url: expectedStreamer.getProfileImageUrl(),
            offline_image_url: expectedStreamer.getOfflineImageUrl(),
            view_count: expectedStreamer.getViewCount(),
            created_at: "2026-07-08T13:40:00.000Z"
        });
    });

    it("should return 400 status when 'id' query parameter is invalid symbol", async () => {
        reqMock.query = { id: Symbol("invalid") as any };

        await streamerController.getStreamerById(reqMock as Request, resMock as Response, nextMock);

        expect(resMock.status).toHaveBeenCalledWith(400);
        expect(resMock.json).toHaveBeenCalledWith({ error: "Invalid or missing 'id' parameter." });
    });

    it("should return 400 status when 'id' contains decimal parts", async () => {
        reqMock.query = { id: "12.34" };

        await streamerController.getStreamerById(reqMock as Request, resMock as Response, nextMock);

        expect(resMock.status).toHaveBeenCalledWith(400);
        expect(resMock.json).toHaveBeenCalledWith({ error: "Invalid or missing 'id' parameter." });
    });

    it("should return 400 status when 'id' contains trailing non-numeric characters", async () => {
        reqMock.query = { id: "12abc" };

        await streamerController.getStreamerById(reqMock as Request, resMock as Response, nextMock);

        expect(resMock.status).toHaveBeenCalledWith(400);
        expect(resMock.json).toHaveBeenCalledWith({ error: "Invalid or missing 'id' parameter." });
    });

    it("should call next with StreamerNotFoundError when streamer is not found", async () => {
        const notFoundError = new StreamerNotFoundError(123);
        streamerServiceMock.getStreamerById.mockRejectedValue(notFoundError);
        reqMock.query = { id: "123" };

        await streamerController.getStreamerById(reqMock as Request, resMock as Response, nextMock);

        expect(nextMock).toHaveBeenCalledWith(notFoundError);
        expect(resMock.status).not.toHaveBeenCalled();
    });

    it("should call next with TwitchUnauthorizedError when service throws it", async () => {
        const twitchError = new TwitchUnauthorizedError();
        streamerServiceMock.getStreamerById.mockRejectedValue(twitchError);
        reqMock.query = { id: "123" };

        await streamerController.getStreamerById(reqMock as Request, resMock as Response, nextMock);

        expect(nextMock).toHaveBeenCalledWith(twitchError);
        expect(resMock.status).not.toHaveBeenCalled();
    });

    it("should call next when an unexpected error occurs", async () => {
        const unexpectedError = new Error("Unexpected DB error");
        streamerServiceMock.getStreamerById.mockRejectedValue(unexpectedError);
        reqMock.query = { id: "123" };

        await streamerController.getStreamerById(reqMock as Request, resMock as Response, nextMock);

        expect(nextMock).toHaveBeenCalledWith(unexpectedError);
        expect(resMock.status).not.toHaveBeenCalled();
    });
});