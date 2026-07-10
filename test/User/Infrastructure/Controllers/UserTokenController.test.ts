import { Request, Response } from 'express';
import { UserTokenController } from 'User/Infrastructure/Controllers/UserTokenController';
import { UserTokenService } from 'User/Application/Services/UserTokenService';

const mockResponse = (): jest.Mocked<Response> => {
    const res = {} as jest.Mocked<Response>;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockRequest = (body: Record<string, unknown> = {}): Request =>
    ({ body } as Request);

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

            await userTokenController.generateToken(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'The email is mandatory' });
            expect(userTokenServiceMock.generateToken).not.toHaveBeenCalled();
        });

        it('should return 400 when email format is invalid', async () => {
            const req = mockRequest({ email: 'not-a-valid-email', api_key: 'someapikey123' });
            const res = mockResponse();

            await userTokenController.generateToken(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'The email must be a valid email address' });
            expect(userTokenServiceMock.generateToken).not.toHaveBeenCalled();
        });

        it('should return 400 when api_key is missing', async () => {
            const req = mockRequest({ email: 'valid@example.com' });
            const res = mockResponse();

            await userTokenController.generateToken(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'The api_key is mandatory' });
            expect(userTokenServiceMock.generateToken).not.toHaveBeenCalled();
        });

        it('should return 401 when service throws Unauthorized', async () => {
            const req = mockRequest({ email: 'valid@example.com', api_key: 'wrongkey' });
            const res = mockResponse();

            userTokenServiceMock.generateToken.mockRejectedValue(new Error('Unauthorized'));

            await userTokenController.generateToken(req, res);

            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized. API access token is invalid.' });
        });

        it('should return 200 with token on success', async () => {
            const email = 'valid@example.com';
            const api_key = 'validapikey123456';
            const token = 'generatedtoken64charslong000000000000000000000000000000000000000';

            userTokenServiceMock.generateToken.mockResolvedValue(token);

            const req = mockRequest({ email, api_key });
            const res = mockResponse();

            await userTokenController.generateToken(req, res);

            expect(userTokenServiceMock.generateToken).toHaveBeenCalledWith(email, api_key);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ token });
        });

        it('should return 500 on unexpected service error', async () => {
            const req = mockRequest({ email: 'valid@example.com', api_key: 'someapikey123' });
            const res = mockResponse();

            userTokenServiceMock.generateToken.mockRejectedValue(new Error('Database connection lost'));

            await userTokenController.generateToken(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error.' });
        });
    });
});
