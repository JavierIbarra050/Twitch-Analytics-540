import { UserService } from "User/Application/Services/UserService";
import { IUserRepository } from "User/Domain/Repositories/IUserRepository";
import { UserMother } from "../Mothers/UserMother";

describe("UserService", () => {
    let userRepositoryMock: jest.Mocked<IUserRepository>;
    let userService: UserService;

    beforeEach(() => {
        userRepositoryMock = {
            saveUser: jest.fn(),
            findByEmail: jest.fn(),
            saveToken: jest.fn(),
            verifyToken: jest.fn()
        } as unknown as jest.Mocked<IUserRepository>;

        userService = new UserService(userRepositoryMock);
    });

    it("should generate an api_key and save the user via repository", async () => {
        const email = "user@example.com";
        const savedUser = UserMother.create({ email });

        userRepositoryMock.saveUser.mockResolvedValue(savedUser);

        const result = await userService.registerNewUser(email);

        expect(userRepositoryMock.saveUser).toHaveBeenCalledWith(email, expect.any(String));
        
        const passedApiKey = userRepositoryMock.saveUser.mock.calls[0][1];
        expect(passedApiKey.length).toBe(32);
        expect(result).toBe(savedUser);
    });

    it("generateApiKey should return a 32-char hex string", () => {
        const apiKey = userService.generateApiKey();
        expect(apiKey).toBeDefined();
        expect(apiKey.length).toBe(32);
        expect(apiKey).toMatch(/^[0-9a-f]{32}$/);
    });
});
