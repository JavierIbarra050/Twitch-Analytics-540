import { EnrichedStream } from "../../Domain/Entities/EnrichedStream";
import { ITwitchClient } from "../../Domain/Repositories/ITwitchClient";

/**
 * Minimum number of streams to fetch from Twitch API to ensure we have
 * a representative sample for sorting and extracting the top streams.
 */
const MINIMUM_STREAMS_TO_FETCH = 100;

export class EnrichedStreamService {
    constructor(
        private readonly twitchClient: ITwitchClient
    ) {}

    /**
     * Obtains the top live streams enriched with user profiles.
     * 
     * @param limit Number of top streams to return.
     * @returns A list of EnrichedStream entities.
     */
    async getTopEnrichedStreams(limit: number): Promise<EnrichedStream[]> {
        if (limit <= 0) {
            return [];
        }

        // We fetch at least 100 streams to local memory to ensure we have a sufficient
        // sample pool to sort by viewerCount descending, in case the source API order
        // fluctuates or we need to guarantee accurate local top rankings.
        const fetchLimit = Math.max(limit, MINIMUM_STREAMS_TO_FETCH);
        const rawStreams = await this.twitchClient.getRawLiveStreams(fetchLimit);

        const sortedStreams = [...rawStreams].sort((a, b) => b.viewerCount - a.viewerCount);
        const topStreams = sortedStreams.slice(0, limit);

        if (topStreams.length === 0) {
            return [];
        }

        const userIds = topStreams.map(stream => stream.userId);
        const userProfiles = await this.twitchClient.getUsersProfiles(userIds);

        const profilesMap = new Map(userProfiles.map(profile => [profile.id, profile]));

        return topStreams.map(stream => {
            const profile = profilesMap.get(stream.userId);
            const userDisplayName = profile ? profile.displayName : stream.userName;
            const profileImageUrl = profile ? profile.profileImageUrl : "";

            return new EnrichedStream(
                stream.id,
                stream.userId,
                stream.userName,
                stream.viewerCount,
                stream.title,
                userDisplayName,
                profileImageUrl
            );
        });
    }
}
