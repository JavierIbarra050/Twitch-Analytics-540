import { UserService } from "User/Application/Services/UserService";
import { IUserRepository } from "User/Domain/Repositories/IUserRepository";
import { UserMother } from "../Mothers/UserMother";

describe("UserService", () => {
    let userRepositoryMock: jest.Mocked<IUserRepository>;
    let userService: UserService;

    beforeEach(() => {
        userRepositoryMock = {
            doesUserAlreadyExists: jest.fn(),
            saveUser: jest.fn(),
            findByEmail: jest.fn(),
            saveToken: jest.fn(),
        } as unknown as jest.Mocked<IUserRepository>;

        userService = new UserService(userRepositoryMock);
    });

    it("should generate an api_key and save a new user when email does not exist", async () => {
        const email = "newuser@example.com";
        const savedUser = UserMother.create({ email });

        userRepositoryMock.doesUserAlreadyExists.mockResolvedValue(false);
        userRepositoryMock.saveUser.mockResolvedValue(savedUser);

        const result = await userService.registerNewUser(email);

        expect(userRepositoryMock.doesUserAlreadyExists).toHaveBeenCalledWith(email);
        expect(userRepositoryMock.saveUser).toHaveBeenCalledWith(email, expect.any(String));
        
        const passedApiKey = userRepositoryMock.saveUser.mock.calls[0][1];
        expect(passedApiKey.length).toBe(32);
        expect(result).toBe(savedUser);
    });

    it("should regenerate api_key and update when email already exists", async () => {
        const email = "existing@example.com";
        const updatedUser = UserMother.create({ email });

        userRepositoryMock.doesUserAlreadyExists.mockResolvedValue(true);
        userRepositoryMock.saveUser.mockResolvedValue(updatedUser);

        const result = await userService.registerNewUser(email);

        expect(userRepositoryMock.doesUserAlreadyExists).toHaveBeenCalledWith(email);
        expect(userRepositoryMock.saveUser).toHaveBeenCalledWith(email, expect.any(String));
        
        const passedApiKey = userRepositoryMock.saveUser.mock.calls[0][1];
        expect(passedApiKey.length).toBe(32);
        expect(result).toBe(updatedUser);
    });

    it("generateApiKey should return a 32-char hex string", () => {
        const apiKey = userService.generateApiKey();
        expect(apiKey).toBeDefined();
        expect(apiKey.length).toBe(32);
        expect(apiKey).toMatch(/^[0-9a-f]{32}$/);
    });
});
