export class Streamer {
    constructor(
        private readonly id: number,
        private readonly login: string,
        private readonly displayName: string,
        private readonly type: string,
        private readonly broadcasterType: string,
        private readonly description: string,
        private readonly profileImageUrl: string,
        private readonly offlineImageUrl: string,
        private readonly viewCount: number,
        private readonly createdAt: Date,
    ) {}

    getId(): number {
        return this.id;
    }

    getLogin(): string {
        return this.login;
    }

    getDisplayName(): string {
        return this.displayName;
    }

    getType(): string {
        return this.type;
    }

    getBroadcasterType(): string {
        return this.broadcasterType;
    }

    getDescription(): string {
        return this.description;
    }

    getProfileImageUrl(): string {
        return this.profileImageUrl;
    }

    getOfflineImageUrl(): string {
        return this.offlineImageUrl;
    }

    getViewCount(): number {
        return this.viewCount;
    }

    getCreatedAt(): Date {
        return this.createdAt;
    }
}
