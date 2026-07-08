"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Streamer = void 0;
class Streamer {
    id;
    displayName;
    type;
    breadcasterType;
    description;
    profileImageUrl;
    offlineImageUrl;
    viewCount;
    createdAt;
    constructor(id, displayName, type, breadcasterType, description, profileImageUrl, offlineImageUrl, viewCount, createdAt) {
        this.id = id;
        this.displayName = displayName;
        this.type = type;
        this.breadcasterType = breadcasterType;
        this.description = description;
        this.profileImageUrl = profileImageUrl;
        this.offlineImageUrl = offlineImageUrl;
        this.viewCount = viewCount;
        this.createdAt = createdAt;
    }
    getStreamerId() {
        return this.id;
    }
    getDisplayName() {
        return this.displayName;
    }
    getType() {
        return this.type;
    }
    getBreadcasterType() {
        return this.breadcasterType;
    }
    getDescription() {
        return this.description;
    }
    getProfileImageUrl() {
        return this.profileImageUrl;
    }
    getOfflineImageUrl() {
        return this.offlineImageUrl;
    }
    getViewCount() {
        return this.viewCount;
    }
    getCreatedAt() {
        return this.createdAt;
    }
}
exports.Streamer = Streamer;
