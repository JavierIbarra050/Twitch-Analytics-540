import { Streamer } from "Streamer/Domain/Entities/Streamer";

export class StreamerMother {
    static create(overrides?: Partial<Streamer>): Streamer {
        return {
            id: 1234567,
            displayName: "",
            type: "",
            breadcasterType: "",
            description: "",
            profileImageUrl: "",
            offlineImageUrl: "",
            viewCount: 12345,
            createdAt: new Date("2014-01-28T19:35:12Z"),
            ...overrides
        };
    }
}