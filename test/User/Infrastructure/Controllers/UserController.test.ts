import { Request, Response } from 'express';
import { UserController } from 'User/Infrastructure/Controllers/UserController';
import { UserService } from 'User/Application/Services/UserService';
import { UserMother } from '../../Mothers/UserMother';

const mockResponse = (): jest.Mocked<Response> => {
    const res = {} as jest.Mocked<Response>;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const mockRequest = (body: Record<string, unknown> = {}): Request =>
    ({ body } as Request);

describe('UserController', () => {
    let userServiceMock: jest.Mocked<UserService>;
    let userController: UserController;

    beforeEach(() => {
        userServiceMock = {
            registerNewUser: jest.fn(),
            generateApiKey: jest.fn(),
        } as unknown as jest.Mocked<UserService>;

        userController = new UserController(userServiceMock);
    });

    describe('register', () => {
        it('should return 400 when email is missing', async () => {
            const req = mockRequest({});
            const res = mockResponse();

            await userController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'The email is mandatory' });
            expect(userServiceMock.registerNewUser).not.toHaveBeenCalled();
        });

        it('should return 400 when body is undefined', async () => {
            const req = { body: undefined } as unknown as Request;
            const res = mockResponse();

            await userController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'The email is mandatory' });
            expect(userServiceMock.registerNewUser).not.toHaveBeenCalled();
        });

        it('should return 400 when email format is invalid', async () => {
            const req = mockRequest({ email: 'not-a-valid-email' });
            const res = mockResponse();

            await userController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ error: 'The email must be a valid email address' });
            expect(userServiceMock.registerNewUser).not.toHaveBeenCalled();
        });

        it('should return 200 with api_key when email is valid', async () => {
            const email = 'valid@example.com';
            const user = UserMother.create({ email, apiKey: 'abc123def456abc1' });

            userServiceMock.registerNewUser.mockResolvedValue(user);

            const req = mockRequest({ email });
            const res = mockResponse();

            await userController.register(req, res);

            expect(userServiceMock.registerNewUser).toHaveBeenCalledWith(email);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ api_key: user.getUserApiKey() });
        });

        it('should return 500 on unexpected service error', async () => {
            const email = 'valid@example.com';

            userServiceMock.registerNewUser.mockRejectedValue(new Error('Unexpected error'));

            const req = mockRequest({ email });
            const res = mockResponse();

            await userController.register(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error.' });
        });
    });
});
