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

        await streamerController.getStreamerById(reqMock as Request, resMock as Response);

        expect(streamerServiceMock.getStreamerById).toHaveBeenCalledWith(83232866);
        expect(resMock.status).toHaveBeenCalledWith(200);
        expect(resMock.json).toHaveBeenCalledWith({
            id: "83232866",
            login: "ibai_",
            display_name: "Ibai",
            type: expectedStreamer.type,
            broadcaster_type: expectedStreamer.broadcasterType,
            description: expectedStreamer.description,
            profile_image_url: expectedStreamer.profileImageUrl,
            offline_image_url: expectedStreamer.offlineImageUrl,
            view_count: expectedStreamer.viewCount,
            created_at: "2026-07-08T13:40:00.000Z"
        });
    });

    it("should return 400 status when 'id' query parameter is invalid symbol", async () => {
        reqMock.query = { id: Symbol("invalid") as any };

        await streamerController.getStreamerById(reqMock as Request, resMock as Response);

        expect(resMock.status).toHaveBeenCalledWith(400);
        expect(resMock.json).toHaveBeenCalledWith({ error: "Invalid or missing 'id' parameter." });
    });

    it("should return 400 status when 'id' contains decimal parts", async () => {
        reqMock.query = { id: "12.34" };

        await streamerController.getStreamerById(reqMock as Request, resMock as Response);

        expect(resMock.status).toHaveBeenCalledWith(400);
        expect(resMock.json).toHaveBeenCalledWith({ error: "Invalid or missing 'id' parameter." });
    });

    it("should return 400 status when 'id' contains trailing non-numeric characters", async () => {
        reqMock.query = { id: "12abc" };

        await streamerController.getStreamerById(reqMock as Request, resMock as Response);

        expect(resMock.status).toHaveBeenCalledWith(400);
        expect(resMock.json).toHaveBeenCalledWith({ error: "Invalid or missing 'id' parameter." });
    });

    it("should return 404 status when streamer is not found", async () => {
        streamerServiceMock.getStreamerById.mockRejectedValue(new StreamerNotFoundError(123));
        reqMock.query = { id: "123" };

        await streamerController.getStreamerById(reqMock as Request, resMock as Response);

        expect(resMock.status).toHaveBeenCalledWith(404);
        expect(resMock.json).toHaveBeenCalledWith({ error: "User not found." });
    });

    it("should return 401 status when service throws TwitchUnauthorizedError", async () => {
        streamerServiceMock.getStreamerById.mockRejectedValue(new TwitchUnauthorizedError());
        reqMock.query = { id: "123" };

        await streamerController.getStreamerById(reqMock as Request, resMock as Response);

        expect(resMock.status).toHaveBeenCalledWith(401);
        expect(resMock.json).toHaveBeenCalledWith({ error: "Unauthorized. Twitch access token is invalid or has expired." });
    });

    it("should return 500 status when an unexpected error occurs", async () => {
        streamerServiceMock.getStreamerById.mockRejectedValue(new Error("Unexpected DB error"));
        reqMock.query = { id: "123" };

        await streamerController.getStreamerById(reqMock as Request, resMock as Response);

        expect(resMock.status).toHaveBeenCalledWith(500);
        expect(resMock.json).toHaveBeenCalledWith({ error: "Internal server error." });
    });
});