import { Request, Response } from 'express';
import { EnrichedStreamController } from "Stream/Infrastructure/Controllers/EnrichedStreamController";
import { StreamService } from "Stream/Application/Services/StreamService";
import { EnrichedStreamMother } from '../../Mothers/EnrichedStreamMother';
import { TwitchUnauthorizedError } from "Shared/Infrastructure/Twitch/TwitchUnauthorizedError";

describe("EnrichedStreamController", () => {
    let controller: EnrichedStreamController;
    let streamServiceMock: jest.Mocked<StreamService>;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;
    let nextMock: jest.Mock;

    beforeEach(() => {
        streamServiceMock = {
            getTopEnrichedStreams: jest.fn()
        } as unknown as jest.Mocked<StreamService>;

        controller = new EnrichedStreamController(streamServiceMock);

        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });

        req = { query: {} };
        res = {
            status: statusMock,
            json: jsonMock
        };
        nextMock = jest.fn();
    });

    it("should return 400 if limit query param is missing", async () => {
        req.query = {};

        await controller.getTopEnrichedStreams(req as Request, res as Response, nextMock);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({ error: "Invalid 'limit' parameter." });
    });

    it("should return 400 if limit query param is not a number", async () => {
        req.query = { limit: "invalid" };

        await controller.getTopEnrichedStreams(req as Request, res as Response, nextMock);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({ error: "Invalid 'limit' parameter." });
    });

    it("should return 400 if limit query param contains decimal values", async () => {
        req.query = { limit: "12.34" };

        await controller.getTopEnrichedStreams(req as Request, res as Response, nextMock);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({ error: "Invalid 'limit' parameter." });
    });

    it("should return 400 if limit query param contains non-numeric suffix", async () => {
        req.query = { limit: "12abc" };

        await controller.getTopEnrichedStreams(req as Request, res as Response, nextMock);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({ error: "Invalid 'limit' parameter." });
    });

    it("should return 400 if limit query param is less than or equal to 0", async () => {
        req.query = { limit: "0" };

        await controller.getTopEnrichedStreams(req as Request, res as Response, nextMock);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({ error: "Invalid 'limit' parameter." });
    });

    it("should return 200 with mapped enriched streams when limit is valid", async () => {
        req.query = { limit: "2" };

        const stream1 = EnrichedStreamMother.create({ streamId: "1", userId: "user1", userName: "User1", viewerCount: 100, title: "Title 1", userDisplayName: "User1 Display", profileImageUrl: "url1" });
        const stream2 = EnrichedStreamMother.create({ streamId: "2", userId: "user2", userName: "User2", viewerCount: 200, title: "Title 2", userDisplayName: "User2 Display", profileImageUrl: "url2" });

        streamServiceMock.getTopEnrichedStreams.mockResolvedValue([stream1, stream2]);

        await controller.getTopEnrichedStreams(req as Request, res as Response, nextMock);

        expect(streamServiceMock.getTopEnrichedStreams).toHaveBeenCalledWith(2);
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith([
            {
                stream_id: "1",
                user_id: "user1",
                user_name: "User1",
                viewer_count: 100,
                title: "Title 1",
                user_display_name: "User1 Display",
                profile_image_url: "url1"
            },
            {
                stream_id: "2",
                user_id: "user2",
                user_name: "User2",
                viewer_count: 200,
                title: "Title 2",
                user_display_name: "User2 Display",
                profile_image_url: "url2"
            }
        ]);
    });

    it("should call next with TwitchUnauthorizedError when service throws it", async () => {
        req.query = { limit: "5" };
        const twitchError = new TwitchUnauthorizedError();
        streamServiceMock.getTopEnrichedStreams.mockRejectedValue(twitchError);

        await controller.getTopEnrichedStreams(req as Request, res as Response, nextMock);

        expect(nextMock).toHaveBeenCalledWith(twitchError);
        expect(statusMock).not.toHaveBeenCalled();
    });

    it("should call next on unexpected errors", async () => {
        req.query = { limit: "5" };
        const unexpectedError = new Error("Database breakdown");
        streamServiceMock.getTopEnrichedStreams.mockRejectedValue(unexpectedError);

        await controller.getTopEnrichedStreams(req as Request, res as Response, nextMock);

        expect(nextMock).toHaveBeenCalledWith(unexpectedError);
        expect(statusMock).not.toHaveBeenCalled();
    });
});
