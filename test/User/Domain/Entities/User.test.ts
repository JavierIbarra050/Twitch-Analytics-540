import { User } from "User/Domain/Entities/User";

describe("User entity", () => {
    it("getUserEmail should return the email passed in constructor", () => {
        const email = "test@example.com";
        const apiKey = "abcd1234efgh5678";
        const user = new User(email, apiKey);

        expect(user.getUserEmail()).toBe(email);
    });

    it("getUserApiKey should return the api_key passed in constructor", () => {
        const email = "test@example.com";
        const apiKey = "abcd1234efgh5678";
        const user = new User(email, apiKey);

        expect(user.getUserApiKey()).toBe(apiKey);
    });
});
