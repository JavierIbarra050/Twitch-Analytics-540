export class TopOfTheTops {
    constructor(
        private readonly gameId: string,
        private readonly gameName: string,
        private readonly userName: string,
        private readonly totalVideos: string,
        private readonly totalViews: string,
        private readonly mostViewedTitle: string,
        private readonly mostViewedViews: string,
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

    getTotalVideos(): string {
        return this.totalVideos;
    }

    getTotalViews(): string {
        return this.totalViews;
    }

    getMostViewedTitle(): string {
        return this.mostViewedTitle;
    }

    getMostViewedViews(): string {
        return this.mostViewedViews;
    }

    getMostViewedDuration(): string {
        return this.mostViewedDuration;
    }

    getMostViewedCreatedAt(): string {
        return this.mostViewedCreatedAt;
    }
}
