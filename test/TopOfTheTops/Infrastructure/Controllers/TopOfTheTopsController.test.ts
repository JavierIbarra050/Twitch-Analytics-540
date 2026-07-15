import { Request, Response } from 'express';
import { TopOfTheTopsController } from '../../../../src/TopOfTheTops/Infrastructure/Controllers/TopOfTheTopsController';
import { TopOfTheTopsService } from '../../../../src/TopOfTheTops/Application/Services/TopOfTheTopsService';
import { TopOfTheTops } from '../../../../src/TopOfTheTops/Domain/Entities/TopOfTheTops';
import { Game } from '../../../../src/TopOfTheTops/Domain/Entities/Game';
import { Video } from '../../../../src/TopOfTheTops/Domain/Entities/Video';
import { TwitchUnauthorizedError } from '../../../../src/Shared/Infrastructure/Twitch/TwitchUnauthorizedError';

describe('TopOfTheTopsController', () => {
    let controller: TopOfTheTopsController;
    let serviceMock: jest.Mocked<TopOfTheTopsService>;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;
    let nextMock: jest.Mock;

    beforeEach(() => {
        serviceMock = {
            getTopOfTheTops: jest.fn()
        } as unknown as jest.Mocked<TopOfTheTopsService>;

        controller = new TopOfTheTopsController(serviceMock);

        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });

        req = { query: {} };
        res = {
            status: statusMock,
            json: jsonMock
        };
        nextMock = jest.fn();
    });

    it('should return 400 Bad Request when since parameter is invalid string', async () => {
        req.query = { since: 'invalid_number' };

        await controller.getTopOfTheTops(req as Request, res as Response, nextMock);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({ error: "Bad Request. Invalid or missing parameters." });
        expect(serviceMock.getTopOfTheTops).not.toHaveBeenCalled();
    });

    it('should return 400 Bad Request when since parameter contains decimals', async () => {
        req.query = { since: '12.34' };

        await controller.getTopOfTheTops(req as Request, res as Response, nextMock);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({ error: "Bad Request. Invalid or missing parameters." });
        expect(serviceMock.getTopOfTheTops).not.toHaveBeenCalled();
    });

    it('should return 400 Bad Request when since parameter contains non-numeric suffix', async () => {
        req.query = { since: '12abc' };

        await controller.getTopOfTheTops(req as Request, res as Response, nextMock);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({ error: "Bad Request. Invalid or missing parameters." });
        expect(serviceMock.getTopOfTheTops).not.toHaveBeenCalled();
    });

    it('should return 200 OK with mapped statistics', async () => {
        const stats = [
            new TopOfTheTops(
                new Game('1', 'Game 1'),
                new Video('v1', 'u1', 'User 1', 'Title 1', 100, '10m', '2026-07-09T00:00:00Z'),
                2,
                200
            )
        ];
        serviceMock.getTopOfTheTops.mockResolvedValue(stats);
        req.query = { since: '600' };

        await controller.getTopOfTheTops(req as Request, res as Response, nextMock);

        expect(serviceMock.getTopOfTheTops).toHaveBeenCalledWith(600);
        expect(statusMock).toHaveBeenCalledWith(200);
        expect(jsonMock).toHaveBeenCalledWith([
            {
                game_id: '1',
                game_name: 'Game 1',
                user_name: 'User 1',
                total_videos: '2',
                total_views: '200',
                most_viewed_title: 'Title 1',
                most_viewed_views: '100',
                most_viewed_duration: '10m',
                most_viewed_created_at: '2026-07-09T00:00:00Z'
            }
        ]);
    });

    it('should return 404 Not Found when no stats are available', async () => {
        serviceMock.getTopOfTheTops.mockResolvedValue([]);

        await controller.getTopOfTheTops(req as Request, res as Response, nextMock);

        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith({ error: "Not Found. No data available." });
    });

    it('should call next with TwitchUnauthorizedError when service throws it', async () => {
        const twitchError = new TwitchUnauthorizedError();
        serviceMock.getTopOfTheTops.mockRejectedValue(twitchError);

        await controller.getTopOfTheTops(req as Request, res as Response, nextMock);

        expect(nextMock).toHaveBeenCalledWith(twitchError);
        expect(statusMock).not.toHaveBeenCalled();
    });

    it('should call next when service throws an unexpected exception', async () => {
        const unexpectedError = new Error('Unexpected error');
        serviceMock.getTopOfTheTops.mockRejectedValue(unexpectedError);

        await controller.getTopOfTheTops(req as Request, res as Response, nextMock);

        expect(nextMock).toHaveBeenCalledWith(unexpectedError);
        expect(statusMock).not.toHaveBeenCalled();
    });
});
