import { Stream } from "../Entities/Stream";

export interface RawStream {
    id: string;
    userId: string;
    userName: string;
    viewerCount: number;
    title: string;
}

export interface UserProfile {
    id: string;
    displayName: string;
    profileImageUrl: string;
}

export interface IStreamRepository {
    getLiveStreams(limit?: number): Promise<Stream[]>;
    getRawLiveStreams(limit: number): Promise<RawStream[]>;
    getUsersProfiles(userIds: string[]): Promise<UserProfile[]>;
}
