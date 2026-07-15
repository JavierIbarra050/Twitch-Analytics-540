import { Game } from "./Game";
import { Video } from "./Video";

export class TopOfTheTops {
    constructor(
        private readonly game: Game,
        private readonly mostViewedVideo: Video,
        private readonly totalVideos: number,
        private readonly totalViews: number,
    ) {}

    getGameId(): string {
        return this.game.getId();
    }

    getGameName(): string {
        return this.game.getName();
    }

    getUserName(): string {
        return this.mostViewedVideo.getUserName();
    }

    getTotalVideos(): number {
        return this.totalVideos;
    }

    getTotalViews(): number {
        return this.totalViews;
    }

    getMostViewedTitle(): string {
        return this.mostViewedVideo.getTitle();
    }

    getMostViewedViews(): number {
        return this.mostViewedVideo.getViewCount();
    }

    getMostViewedDuration(): string {
        return this.mostViewedVideo.getDuration();
    }

    getMostViewedCreatedAt(): string {
        return this.mostViewedVideo.getCreatedAt();
    }
}
