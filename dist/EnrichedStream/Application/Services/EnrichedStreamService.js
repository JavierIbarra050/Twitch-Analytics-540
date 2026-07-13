"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrichedStreamService = void 0;
const EnrichedStream_1 = require("../../Domain/Entities/EnrichedStream");
const MINIMUM_STREAMS_TO_FETCH = 100;
class EnrichedStreamService {
    twitchClient;
    constructor(twitchClient) {
        this.twitchClient = twitchClient;
    }
    async getTopEnrichedStreams(limit) {
        if (limit <= 0) {
            return [];
        }
        const fetchLimit = Math.max(limit, MINIMUM_STREAMS_TO_FETCH);
        const rawStreams = await this.twitchClient.getRawLiveStreams(fetchLimit);
        const sortedStreams = [...rawStreams].sort((a, b) => b.viewerCount - a.viewerCount);
        const topStreams = sortedStreams.slice(0, limit);
        if (topStreams.length === 0) {
            return [];
        }
        const userIds = Array.from(new Set(topStreams.map(stream => stream.userId)));
        const userProfiles = await this.twitchClient.getUsersProfiles(userIds);
        const profilesMap = new Map(userProfiles.map(profile => [profile.id, profile]));
        return topStreams.map(stream => {
            const profile = profilesMap.get(stream.userId);
            const userDisplayName = profile ? profile.displayName : stream.userName;
            const profileImageUrl = profile ? profile.profileImageUrl : "";
            return new EnrichedStream_1.EnrichedStream(stream.id, stream.userId, stream.userName, stream.viewerCount, stream.title, userDisplayName, profileImageUrl);
        });
    }
}
exports.EnrichedStreamService = EnrichedStreamService;
