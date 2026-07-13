import { Streamer } from "Streamer/Domain/Entities/Streamer";

export class StreamerMother {
    static create(overrides?: Partial<Streamer>): Streamer {
        return {
            id: overrides?.id ?? 123456,
            login: overrides?.login ?? "default_streamer",
            displayName: overrides?.displayName ?? "Default Streamer",
            type: overrides?.type ?? "",
            broadcasterType: overrides?.broadcasterType ?? "",
            description: overrides?.description ?? "Default description",
            profileImageUrl: overrides?.profileImageUrl ?? "https://example.com/default.png",
            offlineImageUrl: overrides?.offlineImageUrl ?? "https://example.com/default-offline.png",
            viewCount: overrides?.viewCount ?? 1000,
            createdAt: overrides?.createdAt ?? new Date("2026-07-08T00:00:00Z"),
        };
    }
}