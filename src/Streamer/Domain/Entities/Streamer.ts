export class Streamer {
    constructor (
        private readonly id: number,
        private readonly displayName: string,
        private readonly type: string,
        private readonly breadcasterType: string,
        private readonly description: string,
        private readonly profileImageUrl: string,
        private readonly offlineImageUrl: string,
        private readonly viewCount: number,
        private readonly createdAt: Date,
    ) { }

    public getStreamerId(): number {
        return this.id;
    }

    public getDisplayName(): string {
        return this.displayName;
    }

    public getType(): string {
        return this.type;
    }

    public getBreadcasterType(): string {
        return this.breadcasterType;
    }

    public getDescription(): string {
        return this.description;
    }

    public getProfileImageUrl(): string {
        return this.profileImageUrl;
    }

    public getOfflineImageUrl(): string {
        return this.offlineImageUrl;
    }

    public getViewCount(): number {
        return this.viewCount;
    }

    public getCreatedAt(): Date {
        return this.createdAt;
    }
}