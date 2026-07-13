import { UserTokenService } from "User/Application/Services/UserTokenService";
import { IUserRepository } from "User/Domain/Repositories/IUserRepository";
import { UserMother } from "../Mothers/UserMother";
import { InvalidCredentialsError } from "User/Domain/Errors/InvalidCredentialsError";

describe("UserTokenService", () => {
    let userRepositoryMock: jest.Mocked<IUserRepository>;
    let userTokenService: UserTokenService;

    beforeEach(() => {
        userRepositoryMock = {
            doesUserAlreadyExists: jest.fn(),
            saveUser: jest.fn(),
            findByEmail: jest.fn(),
            saveToken: jest.fn(),
        } as unknown as jest.Mocked<IUserRepository>;

        userTokenService = new UserTokenService(userRepositoryMock, 3);
    });

    it("should return a token when email and api_key are valid", async () => {
        const email = "test@example.com";
        const apiKey = "abcd1234efgh5678";
        const user = UserMother.create({ email, apiKey });

        userRepositoryMock.findByEmail.mockResolvedValue(user);
        userRepositoryMock.saveToken.mockResolvedValue(undefined);

        const token = await userTokenService.generateToken(email, apiKey);

        expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith(email);
        expect(userRepositoryMock.saveToken).toHaveBeenCalledWith(
            email,
            token,
            expect.any(Date)
        );
        expect(token).toBeDefined();
        expect(token.length).toBe(64);
    });

    it("should throw InvalidCredentialsError when user does not exist", async () => {
        const email = "notfound@example.com";
        const apiKey = "somekey";

        userRepositoryMock.findByEmail.mockResolvedValue(null);

        await expect(userTokenService.generateToken(email, apiKey)).rejects.toBeInstanceOf(InvalidCredentialsError);
        expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith(email);
        expect(userRepositoryMock.saveToken).not.toHaveBeenCalled();
    });

    it("should throw InvalidCredentialsError when api_key does not match", async () => {
        const email = "test@example.com";
        const correctApiKey = "correctKey";
        const wrongApiKey = "wrongKey";
        const user = UserMother.create({ email, apiKey: correctApiKey });

        userRepositoryMock.findByEmail.mockResolvedValue(user);

        await expect(userTokenService.generateToken(email, wrongApiKey)).rejects.toBeInstanceOf(InvalidCredentialsError);
        expect(userRepositoryMock.findByEmail).toHaveBeenCalledWith(email);
        expect(userRepositoryMock.saveToken).not.toHaveBeenCalled();
    });

    it("should save token with expiration 3 days from now", async () => {
        const email = "test@example.com";
        const apiKey = "abcd1234efgh5678";
        const user = UserMother.create({ email, apiKey });

        userRepositoryMock.findByEmail.mockResolvedValue(user);

        const start = new Date();
        const token = await userTokenService.generateToken(email, apiKey);
        const end = new Date();

        expect(userRepositoryMock.saveToken).toHaveBeenCalledWith(
            email,
            token,
            expect.any(Date)
        );

        const passedDate = userRepositoryMock.saveToken.mock.calls[0][2];
        
        const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
        const expectedExpiresAtStart = new Date(start.getTime() + threeDaysInMs);
        const expectedExpiresAtEnd = new Date(end.getTime() + threeDaysInMs);

        expect(passedDate.getTime()).toBeGreaterThanOrEqual(expectedExpiresAtStart.getTime());
        expect(passedDate.getTime()).toBeLessThanOrEqual(expectedExpiresAtEnd.getTime());
    });
});
