import { Request, Response } from 'express';
import { TopOfTheTopsController } from '../../../../src/TopOfTheTops/Infrastructure/Controllers/TopOfTheTopsController';
import { TopOfTheTopsService } from '../../../../src/TopOfTheTops/Application/Services/TopOfTheTopsService';
import { TopOfTheTops } from '../../../../src/TopOfTheTops/Domain/Entities/TopOfTheTops';

describe('TopOfTheTopsController', () => {
    let controller: TopOfTheTopsController;
    let serviceMock: jest.Mocked<TopOfTheTopsService>;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

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
    });

    it('should return 400 Bad Request when since parameter is invalid', async () => {
        req.query = { since: 'invalid_number' };

        await controller.getTopOfTheTops(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(400);
        expect(jsonMock).toHaveBeenCalledWith({ error: "Bad Request. Invalid or missing parameters." });
        expect(serviceMock.getTopOfTheTops).not.toHaveBeenCalled();
    });

    it('should return 200 OK with mapped statistics', async () => {
        const stats = [
            new TopOfTheTops('1', 'Game 1', 'User 1', '2', '200', 'Title 1', '100', '10m', '2026-07-09T00:00:00Z')
        ];
        serviceMock.getTopOfTheTops.mockResolvedValue(stats);
        req.query = { since: '600' };

        await controller.getTopOfTheTops(req as Request, res as Response);

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

        await controller.getTopOfTheTops(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(404);
        expect(jsonMock).toHaveBeenCalledWith({ error: "Not Found. No data available." });
    });

    it('should return 500 Internal Server Error when service throws an exception', async () => {
        serviceMock.getTopOfTheTops.mockRejectedValue(new Error('Unexpected error'));

        await controller.getTopOfTheTops(req as Request, res as Response);

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({ error: "Internal Server Error. Please try again later." });
    });
});
