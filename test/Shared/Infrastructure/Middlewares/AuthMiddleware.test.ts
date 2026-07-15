import { Request, Response, NextFunction } from 'express';
import { AuthMiddleware } from '../../../../src/Shared/Infrastructure/Middlewares/AuthMiddleware';
import { IUserRepository } from '../../../../src/User/Domain/Repositories/IUserRepository';

describe("AuthMiddleware", () => {
    let middleware: AuthMiddleware;
    let userRepositoryMock: jest.Mocked<IUserRepository>;
    let req: Partial<Request>;
    let res: Partial<Response>;
    let next: NextFunction;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        userRepositoryMock = {
            saveUser: jest.fn(),
            findByEmail: jest.fn(),
            saveToken: jest.fn(),
            verifyToken: jest.fn()
        } as unknown as jest.Mocked<IUserRepository>;

        middleware = new AuthMiddleware(userRepositoryMock);
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        next = jest.fn();

        req = { headers: {} };
        res = {
            status: statusMock,
            json: jsonMock
        };
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

    it("should return 401 if authorization header is an array (duplicate headers)", async () => {
        req.headers = { authorization: ["Bearer token1", "Bearer token2"] as any };

        await middleware.execute(req as Request, res as Response, next);

        expect(statusMock).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledWith({ error: "Unauthorized. Token is invalid or expired." });
        expect(next).not.toHaveBeenCalled();
    });

    it("should return 401 if token is not found or expired in database", async () => {
        req.headers = { authorization: "Bearer invalidtoken" };
        userRepositoryMock.verifyToken.mockResolvedValue(false);

        await middleware.execute(req as Request, res as Response, next);

        expect(userRepositoryMock.verifyToken).toHaveBeenCalledWith("invalidtoken");
        expect(statusMock).toHaveBeenCalledWith(401);
        expect(jsonMock).toHaveBeenCalledWith({ error: "Unauthorized. Token is invalid or expired." });
        expect(next).not.toHaveBeenCalled();
    });

    it("should call next if token is valid and active in database", async () => {
        req.headers = { authorization: "Bearer validtoken" };
        userRepositoryMock.verifyToken.mockResolvedValue(true);

        await middleware.execute(req as Request, res as Response, next);

        expect(next).toHaveBeenCalled();
        expect(statusMock).not.toHaveBeenCalled();
    });

    it("should return 500 on database error", async () => {
        req.headers = { authorization: "Bearer validtoken" };
        userRepositoryMock.verifyToken.mockRejectedValue(new Error("DB Connection Error"));

        await middleware.execute(req as Request, res as Response, next);

        expect(statusMock).toHaveBeenCalledWith(500);
        expect(jsonMock).toHaveBeenCalledWith({ error: "Internal server error." });
        expect(next).not.toHaveBeenCalled();
    });
});
