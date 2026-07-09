import { User } from "User/Domain/Entities/User";

export class UserMother {
    static create(overrides?: { email?: string; apiKey?: string }): User {
        return new User(
            overrides?.email ?? "test@example.com",
            overrides?.apiKey ?? "abcd1234efgh5678"
        );
    }
}
