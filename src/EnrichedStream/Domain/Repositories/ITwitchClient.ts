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

export interface ITwitchClient {
    getRawLiveStreams(limit: number): Promise<RawStream[]>;
    getUsersProfiles(userIds: string[]): Promise<UserProfile[]>;
}
