import { EnrichedStream } from "../../../src/Stream/Domain/Entities/EnrichedStream";
import { RawStream, UserProfile } from "../../../src/Stream/Domain/Repositories/IStreamRepository";

export class EnrichedStreamMother {
    static create(params: Partial<{
        streamId: string;
        userId: string;
        userName: string;
        viewerCount: number;
        title: string;
        userDisplayName: string;
        profileImageUrl: string;
    }> = {}): EnrichedStream {

        return new EnrichedStream(
            params.streamId ?? "987654321",
            params.userId ?? "111111111",
            params.userName ?? "TopStreamer1",
            params.viewerCount ?? 34567,
            params.title ?? "Epic Gaming Session",
            params.userDisplayName ?? "TopStreamer1",
            params.profileImageUrl ?? "https://static-cdn/image.png"
        );
    }

    static createRawStream(params: Partial<RawStream> = {}): RawStream {
        return {
            id: params.id ?? "987654321",
            userId: params.userId ?? "111111111",
            userName: params.userName ?? "TopStreamer1",
            viewerCount: params.viewerCount ?? 34567,
            title: params.title ?? "Epic Gaming Session",
        };
    }

    static createUserProfile(params: Partial<UserProfile> = {}): UserProfile {
        return {
            id: params.id ?? "111111111",
            displayName: params.displayName ?? "TopStreamer1",
            profileImageUrl: params.profileImageUrl ?? "https://static-cdn/image.png",
        };
    }
}
