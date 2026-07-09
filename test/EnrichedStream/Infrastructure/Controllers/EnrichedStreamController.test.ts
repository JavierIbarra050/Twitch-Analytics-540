import { Request, Response } from 'express';
import { EnrichedStreamController } from '../../../../src/EnrichedStream/Infrastructure/Controller/EnrichedStreamController';
import { EnrichedStreamService } from '../../../../src/EnrichedStream/Application/Services/EnrichedStreamService';
import { EnrichedStreamMother } from '../../Mothers/EnrichedStreamMother';

describe("EnrichedStreamController", () => {
    let controller: EnrichedStreamController;
    let serviceMock: jest.Mocked<EnrichedStreamService>;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        serviceMock = {
            getTopEnrichedStreams: jest.fn()
        } as unknown as jest.Mocked<EnrichedStreamService>;

        controller = new EnrichedStreamController(serviceMock);

        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });

        req = { query: {} };
        res = {
            status: statusMock,
            json: jsonMock
        };
    });

    it("should return 400 if limit query param is missing", async () => {
        req.query = {};

        await controller.getTopEnrichedStreams(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({ error: "Invalid 'limit' parameter." });
    });

    it("should return 400 if limit query param is not a number", async () => {
        req.query = { limit: "invalid" };

        await controller.getTopEnrichedStreams(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({ error: "Invalid 'limit' parameter." });
    });

    it("should return 400 if limit query param is less than or equal to 0", async () => {
        req.query = { limit: "0" };

        await controller.getTopEnrichedStreams(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({ error: "Invalid 'limit' parameter." });
    });

    it("should return 200 with mapped enriched streams when limit is valid", async () => {
        req.query = { limit: "2" };

        const stream1 = EnrichedStreamMother.create({ streamId: "1", userId: "user1", userName: "User1", viewerCount: 100, title: "Title 1", userDisplayName: "User1 Display", profileImageUrl: "url1" });
        const stream2 = EnrichedStreamMother.create({ streamId: "2", userId: "user2", userName: "User2", viewerCount: 200, title: "Title 2", userDisplayName: "User2 Display", profileImageUrl: "url2" });

        serviceMock.getTopEnrichedStreams.mockResolvedValue([stream1, stream2]);

        await controller.getTopEnrichedStreams(req as Request, res as Response);

        expect(serviceMock.getTopEnrichedStreams).toHaveBeenCalledWith(2);
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

    it("should return 401 if service throws an unauthorized error", async () => {
        req.query = { limit: "5" };
        const unauthorizedError = new Error("Request failed with status code 401");
        serviceMock.getTopEnrichedStreams.mockRejectedValue(unauthorizedError);

        await controller.getTopEnrichedStreams(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledWith({ error: "Unauthorized. Twitch access token is invalid or has expired." });
    });

    it("should return 500 on unexpected errors", async () => {
        req.query = { limit: "5" };
        serviceMock.getTopEnrichedStreams.mockRejectedValue(new Error("Database breakdown"));

        await controller.getTopEnrichedStreams(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({ error: "Internal server error." });
    });
});
