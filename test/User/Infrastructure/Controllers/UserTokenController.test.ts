import { Request, Response } from 'express';
import { UserTokenController } from 'User/Infrastructure/Controllers/UserTokenController';
import { UserTokenService } from 'User/Application/Services/UserTokenService';
import { InvalidCredentialsError } from 'User/Domain/Errors/InvalidCredentialsError';

const mockResponse = (): jest.Mocked<Response> => {
    const res = {} as jest.Mocked<Response>;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockRequest = (body: Record<string, unknown> = {}): Request =>
    ({ body } as Request);

const mockNext = (): jest.Mock => jest.fn();

describe('UserTokenController', () => {
    let userTokenServiceMock: jest.Mocked<UserTokenService>;
    let userTokenController: UserTokenController;

    beforeEach(() => {
        userTokenServiceMock = {
            generateToken: jest.fn(),
        } as unknown as jest.Mocked<UserTokenService>;

        userTokenController = new UserTokenController(userTokenServiceMock);
    });

    describe('generateToken', () => {
        it('should return 400 when email is missing', async () => {
            const req = mockRequest({ api_key: 'someapikey123' });
            const res = mockResponse();
            const next = mockNext();

            await userTokenController.generateToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'The email is mandatory' });
            expect(userTokenServiceMock.generateToken).not.toHaveBeenCalled();
        });

        it('should return 400 when body is undefined', async () => {
            const req = { body: undefined } as unknown as Request;
            const res = mockResponse();
            const next = mockNext();

            await userTokenController.generateToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'The email is mandatory' });
            expect(userTokenServiceMock.generateToken).not.toHaveBeenCalled();
        });

        it('should return 400 when email format is invalid', async () => {
            const req = mockRequest({ email: 'not-a-valid-email', api_key: 'someapikey123' });
            const res = mockResponse();
            const next = mockNext();

            await userTokenController.generateToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'The email must be a valid email address' });
            expect(userTokenServiceMock.generateToken).not.toHaveBeenCalled();
        });

        it('should return 400 when api_key is missing', async () => {
            const req = mockRequest({ email: 'valid@example.com' });
            const res = mockResponse();
            const next = mockNext();

            await userTokenController.generateToken(req, res, next);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'The api_key is mandatory' });
            expect(userTokenServiceMock.generateToken).not.toHaveBeenCalled();
        });

        it('should call next with InvalidCredentialsError when service throws it', async () => {
            const req = mockRequest({ email: 'valid@example.com', api_key: 'wrongkey' });
            const res = mockResponse();
            const next = mockNext();
            const credentialsError = new InvalidCredentialsError();

            userTokenServiceMock.generateToken.mockRejectedValue(credentialsError);

            await userTokenController.generateToken(req, res, next);

            expect(next).toHaveBeenCalledWith(credentialsError);
            expect(res.status).not.toHaveBeenCalled();
        });

        it('should return 200 with token on success', async () => {
            const email = 'valid@example.com';
            const api_key = 'validapikey123456';
            const token = 'generatedtoken64charslong000000000000000000000000000000000000000';

            userTokenServiceMock.generateToken.mockResolvedValue(token);

            const req = mockRequest({ email, api_key });
            const res = mockResponse();
            const next = mockNext();

            await userTokenController.generateToken(req, res, next);

            expect(userTokenServiceMock.generateToken).toHaveBeenCalledWith(email, api_key);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ token });
        });

        it('should call next on unexpected service error', async () => {
            const req = mockRequest({ email: 'valid@example.com', api_key: 'someapikey123' });
            const res = mockResponse();
            const next = mockNext();
            const unexpectedError = new Error('Database connection lost');

            userTokenServiceMock.generateToken.mockRejectedValue(unexpectedError);

            await userTokenController.generateToken(req, res, next);

            expect(next).toHaveBeenCalledWith(unexpectedError);
            expect(res.status).not.toHaveBeenCalled();
        });
    });
});
