import { Streamer } from "Streamer/Domain/Entities/Streamer";

export class StreamerMother {
    static create(overrides?: Partial<{
        id: number;
        login: string;
        displayName: string;
        type: string;
        broadcasterType: string;
        description: string;
        profileImageUrl: string;
        offlineImageUrl: string;
        viewCount: number;
        createdAt: Date;
    }>): Streamer {
        return new Streamer(
            overrides?.id ?? 123456,
            overrides?.login ?? "default_streamer",
            overrides?.displayName ?? "Default Streamer",
            overrides?.type ?? "",
            overrides?.broadcasterType ?? "",
            overrides?.description ?? "Default description",
            overrides?.profileImageUrl ?? "https://example.com/default.png",
            overrides?.offlineImageUrl ?? "https://example.com/default-offline.png",
            overrides?.viewCount ?? 1000,
            overrides?.createdAt ?? new Date("2026-07-08T00:00:00Z"),
        );
    }
}
