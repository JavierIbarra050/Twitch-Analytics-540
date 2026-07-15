import { Stream } from "../../Domain/Entities/Stream";
import { EnrichedStream } from "../../Domain/Entities/EnrichedStream";
import { IStreamRepository } from "../../Domain/Repositories/IStreamRepository";

const MINIMUM_STREAMS_TO_FETCH = 100;
const TWITCH_MAX_STREAMS_PER_REQUEST = 100;

export class StreamService {
    constructor(
        private readonly streamRepository: IStreamRepository,
    ) { }

    async getLiveStreams(): Promise<Stream[]> {
        return await this.streamRepository.getLiveStreams();
    }

    async getTopEnrichedStreams(limit: number): Promise<EnrichedStream[]> {
        if (limit <= 0) {
            return [];
        }

        const fetchLimit = Math.min(Math.max(limit, MINIMUM_STREAMS_TO_FETCH), TWITCH_MAX_STREAMS_PER_REQUEST);
        const rawStreams = await this.streamRepository.getRawLiveStreams(fetchLimit);

        const sortedStreams = [...rawStreams].sort((a, b) => b.viewerCount - a.viewerCount);
        const topStreams = sortedStreams.slice(0, limit);

        if (topStreams.length === 0) {
            return [];
        }

        const userIds = Array.from(new Set(topStreams.map(stream => stream.userId)));
        const userProfiles = await this.streamRepository.getUsersProfiles(userIds);

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
