import { Request, Response, NextFunction } from 'express';
import { AuthMiddleware } from '../../../../src/Shared/Infrastructure/Middlewares/AuthMiddleware';
import * as database from '../../../../src/Shared/Infrastructure/Database/database';

jest.mock('../../../../src/Shared/Infrastructure/Database/database');

describe("AuthMiddleware", () => {
    let middleware: AuthMiddleware;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;
    let dbMock: any;

    beforeEach(() => {
        middleware = new AuthMiddleware();
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        next = jest.fn();

        req = { headers: {} };
        res = {
            status: statusMock,
            json: jsonMock
        };

        dbMock = {
            get: jest.fn()
        };
        jest.spyOn(database, 'getDatabase').mockResolvedValue(dbMock);
    });

    it("should return 401 if authorization header is missing", async () => {
        req.headers = {};

        await middleware.execute(req as Request, res as Response, next);

        expect(statusMock).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledWith({ error: "Unauthorized. Token is invalid or expired." });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 if authorization header is not Bearer type", async () => {
        req.headers = { authorization: "Basic credential" };

        await middleware.execute(req as Request, res as Response, next);

        expect(statusMock).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledWith({ error: "Unauthorized. Token is invalid or expired." });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 if token is not found or expired in database", async () => {
        req.headers = { authorization: "Bearer invalidtoken" };
        dbMock.get.mockResolvedValue(undefined);

        await middleware.execute(req as Request, res as Response, next);

        expect(dbMock.get).toHaveBeenCalledWith(
            "SELECT id FROM user_tokens WHERE token = ? AND expires_at > datetime('now')",
            ["invalidtoken"]
        );
        expect(statusMock).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledWith({ error: "Unauthorized. Token is invalid or expired." });
        expect(next).not.toHaveBeenCalled();
    });

    it("should call next if token is valid and active in database", async () => {
        req.headers = { authorization: "Bearer validtoken" };
        dbMock.get.mockResolvedValue({ id: 1, user_id: 1, token: "validtoken" });

        await middleware.execute(req as Request, res as Response, next);

        expect(next).toHaveBeenCalled();
        expect(statusMock).not.toHaveBeenCalled();
    });

    it("should return 500 on database error", async () => {
        req.headers = { authorization: "Bearer validtoken" };
        dbMock.get.mockRejectedValue(new Error("DB Connection Error"));

        await middleware.execute(req as Request, res as Response, next);

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({ error: "Internal server error." });
        expect(next).not.toHaveBeenCalled();
    });
});
