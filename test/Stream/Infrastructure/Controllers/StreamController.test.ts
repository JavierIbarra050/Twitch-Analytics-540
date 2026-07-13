import { Request, Response } from 'express';
import { StreamController } from "Stream/Infrastructure/Controllers/StreamController";
import { StreamService } from "Stream/Application/Services/StreamService";
import { StreamMother } from "../../Mothers/StreamMother";
import { TwitchUnauthorizedError } from "Shared/Infrastructure/Twitch/TwitchUnauthorizedError";

describe("StreamController", () => {
    let streamServiceMock: jest.Mocked<StreamService>;
    let streamController: StreamController;
    let reqMock: Partial<Request>;
    let resMock: Partial<Response>;

    beforeEach(() => {
        streamServiceMock = {
            getLiveStreams: jest.fn(),
        } as unknown as jest.Mocked<StreamService>;

        streamController = new StreamController(streamServiceMock);

        reqMock = {
            query: {}
        };

        resMock = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    it("should return live streams list and 200 status when streams exist", async () => {
        const expectedStreams = [
            StreamMother.create({ title: "Charlando", userName: "Ibai" }),
            StreamMother.create({ title: "Minecraft", userName: "Auronplay" })
        ];

        streamServiceMock.getLiveStreams.mockResolvedValue(expectedStreams);

        await streamController.getLiveStreams(reqMock as Request, resMock as Response);

        expect(streamServiceMock.getLiveStreams).toHaveBeenCalledWith();
        expect(resMock.status).toHaveBeenCalledWith(200);
        expect(resMock.json).toHaveBeenCalledWith([
            { title: "Charlando", user_name: "Ibai" },
            { title: "Minecraft", user_name: "Auronplay" }
        ]);
    });

    it("should return 401 status when service throws TwitchUnauthorizedError", async () => {
        streamServiceMock.getLiveStreams.mockRejectedValue(new TwitchUnauthorizedError());

        await streamController.getLiveStreams(reqMock as Request, resMock as Response);

        expect(resMock.status).toHaveBeenCalledWith(401);
        expect(resMock.json).toHaveBeenCalledWith({ error: "Unauthorized. Twitch access token is invalid or has expired." });
    });

    it("should return 500 status when an unexpected error occurs", async () => {
        streamServiceMock.getLiveStreams.mockRejectedValue(new Error("Unexpected system error"));

        await streamController.getLiveStreams(reqMock as Request, resMock as Response);

        expect(resMock.status).toHaveBeenCalledWith(500);
        expect(resMock.json).toHaveBeenCalledWith({ error: "Internal server error." });
    });
});
