export class EnrichedStream {
    constructor(
        private readonly streamId: string,
        private readonly userId: string,
        private readonly userName: string,
        private readonly viewerCount: number,
        private readonly title: string,
        private readonly userDisplayName: string,
        private readonly profileImageUrl: string,
    ) {}

    getStreamId(): string {
        return this.streamId;
    }

    getUserId(): string {
        return this.userId;
    }

    getUserName(): string {
        return this.userName;
    }

    getViewerCount(): number {
        return this.viewerCount;
    }

    getTitle(): string {
        return this.title;
    }

    getUserDisplayName(): string {
        return this.userDisplayName;
    }

    getProfileImageUrl(): string {
        return this.profileImageUrl;
    }
}
