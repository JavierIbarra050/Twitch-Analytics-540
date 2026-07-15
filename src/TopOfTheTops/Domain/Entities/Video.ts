export class Video {
    constructor(
        private readonly id: string,
        private readonly userId: string,
        private readonly userName: string,
        private readonly title: string,
        private readonly viewCount: number,
        private readonly duration: string,
        private readonly createdAt: string,
    ) {}

    getId(): string {
        return this.id;
    }

    getUserId(): string {
        return this.userId;
    }

    getUserName(): string {
        return this.userName;
    }

    getTitle(): string {
        return this.title;
    }

    getViewCount(): number {
        return this.viewCount;
    }

    getDuration(): string {
        return this.duration;
    }

    getCreatedAt(): string {
        return this.createdAt;
    }
}
