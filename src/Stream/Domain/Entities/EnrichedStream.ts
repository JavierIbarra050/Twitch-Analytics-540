import { Stream } from "./Stream";

export class EnrichedStream {
    private readonly stream: Stream;

    constructor(
        private readonly streamId: string,
        private readonly userId: string,
        userName: string,
        private readonly viewerCount: number,
        title: string,
        private readonly userDisplayName: string,
        private readonly profileImageUrl: string,
    ) {
        this.stream = new Stream(title, userName);
    }

    getStreamId(): string {
        return this.streamId;
    }

    getUserId(): string {
        return this.userId;
    }

    getUserName(): string {
        return this.stream.getUserName();
    }

    getViewerCount(): number {
        return this.viewerCount;
    }

    getTitle(): string {
        return this.stream.getTitle();
    }

    getUserDisplayName(): string {
        return this.userDisplayName;
    }

    getProfileImageUrl(): string {
        return this.profileImageUrl;
    }
}
