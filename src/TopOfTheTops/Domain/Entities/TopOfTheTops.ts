export class TopOfTheTops {
    constructor(
        private readonly gameId: string,
        private readonly gameName: string,
        private readonly userName: string,
        private readonly totalVideos: number,
        private readonly totalViews: number,
        private readonly mostViewedTitle: string,
        private readonly mostViewedViews: number,
        private readonly mostViewedDuration: string,
        private readonly mostViewedCreatedAt: string,
    ) {}

    getGameId(): string {
        return this.gameId;
    }

    getGameName(): string {
        return this.gameName;
    }

    getUserName(): string {
        return this.userName;
    }

    getTotalVideos(): number {
        return this.totalVideos;
    }

    getTotalViews(): number {
        return this.totalViews;
    }

    getMostViewedTitle(): string {
        return this.mostViewedTitle;
    }

    getMostViewedViews(): number {
        return this.mostViewedViews;
    }

    getMostViewedDuration(): string {
        return this.mostViewedDuration;
    }

    getMostViewedCreatedAt(): string {
        return this.mostViewedCreatedAt;
    }
}
