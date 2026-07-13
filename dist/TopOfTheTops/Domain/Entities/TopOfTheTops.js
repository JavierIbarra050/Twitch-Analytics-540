"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TopOfTheTops = void 0;
class TopOfTheTops {
    gameId;
    gameName;
    userName;
    totalVideos;
    totalViews;
    mostViewedTitle;
    mostViewedViews;
    mostViewedDuration;
    mostViewedCreatedAt;
    constructor(gameId, gameName, userName, totalVideos, totalViews, mostViewedTitle, mostViewedViews, mostViewedDuration, mostViewedCreatedAt) {
        this.gameId = gameId;
        this.gameName = gameName;
        this.userName = userName;
        this.totalVideos = totalVideos;
        this.totalViews = totalViews;
        this.mostViewedTitle = mostViewedTitle;
        this.mostViewedViews = mostViewedViews;
        this.mostViewedDuration = mostViewedDuration;
        this.mostViewedCreatedAt = mostViewedCreatedAt;
    }
    getGameId() {
        return this.gameId;
    }
    getGameName() {
        return this.gameName;
    }
    getUserName() {
        return this.userName;
    }
    getTotalVideos() {
        return this.totalVideos;
    }
    getTotalViews() {
        return this.totalViews;
    }
    getMostViewedTitle() {
        return this.mostViewedTitle;
    }
    getMostViewedViews() {
        return this.mostViewedViews;
    }
    getMostViewedDuration() {
        return this.mostViewedDuration;
    }
    getMostViewedCreatedAt() {
        return this.mostViewedCreatedAt;
    }
}
exports.TopOfTheTops = TopOfTheTops;
