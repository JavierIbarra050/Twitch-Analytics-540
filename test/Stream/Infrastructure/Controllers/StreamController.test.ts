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
    let nextMock: jest.Mock;

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

        nextMock = jest.fn();
    });

    it("should return live streams list and 200 status when streams exist", async () => {
        const expectedStreams = [
            StreamMother.create({ title: "Charlando", userName: "Ibai" }),
            StreamMother.create({ title: "Minecraft", userName: "Auronplay" })
        ];

        streamServiceMock.getLiveStreams.mockResolvedValue(expectedStreams);

        await streamController.getLiveStreams(reqMock as Request, resMock as Response, nextMock);

        expect(streamServiceMock.getLiveStreams).toHaveBeenCalledWith();
        expect(resMock.status).toHaveBeenCalledWith(200);
        expect(resMock.json).toHaveBeenCalledWith([
            { title: "Charlando", user_name: "Ibai" },
            { title: "Minecraft", user_name: "Auronplay" }
        ]);
    });

    it("should call next with TwitchUnauthorizedError when service throws it", async () => {
        const twitchError = new TwitchUnauthorizedError();
        streamServiceMock.getLiveStreams.mockRejectedValue(twitchError);

        await streamController.getLiveStreams(reqMock as Request, resMock as Response, nextMock);

        expect(nextMock).toHaveBeenCalledWith(twitchError);
        expect(resMock.status).not.toHaveBeenCalled();
    });

    it("should call next when an unexpected error occurs", async () => {
        const unexpectedError = new Error("Unexpected system error");
        streamServiceMock.getLiveStreams.mockRejectedValue(unexpectedError);

        await streamController.getLiveStreams(reqMock as Request, resMock as Response, nextMock);

        expect(nextMock).toHaveBeenCalledWith(unexpectedError);
        expect(resMock.status).not.toHaveBeenCalled();
    });
});
