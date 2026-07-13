"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrichedStream = void 0;
class EnrichedStream {
    streamId;
    userId;
    userName;
    viewerCount;
    title;
    userDisplayName;
    profileImageUrl;
    constructor(streamId, userId, userName, viewerCount, title, userDisplayName, profileImageUrl) {
        this.streamId = streamId;
        this.userId = userId;
        this.userName = userName;
        this.viewerCount = viewerCount;
        this.title = title;
        this.userDisplayName = userDisplayName;
        this.profileImageUrl = profileImageUrl;
    }
    getStreamId() {
        return this.streamId;
    }
    getUserId() {
        return this.userId;
    }
    getUserName() {
        return this.userName;
    }
    getViewerCount() {
        return this.viewerCount;
    }
    getTitle() {
        return this.title;
    }
    getUserDisplayName() {
        return this.userDisplayName;
    }
    getProfileImageUrl() {
        return this.profileImageUrl;
    }
}
exports.EnrichedStream = EnrichedStream;
