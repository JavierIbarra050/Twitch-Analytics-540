import { EnrichedStreamService } from "../../../../src/Stream/EnrichedStream/Application/Services/EnrichedStreamService";
import { ITwitchClient } from "../../../../src/Stream/EnrichedStream/Domain/Repositories/ITwitchClient";
import { EnrichedStreamMother } from "../Mothers/EnrichedStreamMother";

describe("EnrichedStreamService", () => {
    let service: EnrichedStreamService;
    let twitchClientMock: jest.Mocked<ITwitchClient>;

    beforeEach(() => {
        twitchClientMock = {
            getRawLiveStreams: jest.fn(),
            getUsersProfiles: jest.fn(),
        };
        service = new EnrichedStreamService(twitchClientMock);
    });

    it("should return empty array if limit is less than or equal to 0", async () => {
        const result = await service.getTopEnrichedStreams(0);
        expect(result).toEqual([]);
        expect(twitchClientMock.getRawLiveStreams).not.toHaveBeenCalled();
    });

    it("should fetch, sort, limit and enrich streams correctly", async () => {
        const rawStream1 = EnrichedStreamMother.createRawStream({ id: "1", userId: "user1", viewerCount: 100, userName: "User One" });
        const rawStream2 = EnrichedStreamMother.createRawStream({ id: "2", userId: "user2", viewerCount: 500, userName: "User Two" });
        const rawStream3 = EnrichedStreamMother.createRawStream({ id: "3", userId: "user3", viewerCount: 300, userName: "User Three" });

        const profile1 = EnrichedStreamMother.createUserProfile({ id: "user1", displayName: "User One Enriched", profileImageUrl: "url1" });
        const profile2 = EnrichedStreamMother.createUserProfile({ id: "user2", displayName: "User Two Enriched", profileImageUrl: "url2" });

        twitchClientMock.getRawLiveStreams.mockResolvedValue([rawStream1, rawStream2, rawStream3]);
        twitchClientMock.getUsersProfiles.mockResolvedValue([profile1, profile2]);

        const result = await service.getTopEnrichedStreams(2);

        expect(twitchClientMock.getRawLiveStreams).toHaveBeenCalledWith(100);
        expect(twitchClientMock.getUsersProfiles).toHaveBeenCalledWith(["user2", "user3"]);

        expect(result.length).toBe(2);

        expect(result[0].getStreamId()).toBe("2");
        expect(result[0].getUserId()).toBe("user2");
        expect(result[0].getUserDisplayName()).toBe("User Two Enriched");
        expect(result[0].getProfileImageUrl()).toBe("url2");
        expect(result[0].getViewerCount()).toBe(500);

        expect(result[1].getStreamId()).toBe("3");
        expect(result[1].getUserId()).toBe("user3");
        expect(result[1].getUserDisplayName()).toBe("User Three"); 
        expect(result[1].getProfileImageUrl()).toBe("");
        expect(result[1].getViewerCount()).toBe(300);
    });

    it("should cap the fetch limit at Twitch's max of 100 even when a larger limit is requested", async () => {
        twitchClientMock.getRawLiveStreams.mockResolvedValue([]);
        twitchClientMock.getUsersProfiles.mockResolvedValue([]);

        await service.getTopEnrichedStreams(150);

        expect(twitchClientMock.getRawLiveStreams).toHaveBeenCalledWith(100);
    });

    it("should return empty array if no live streams are found", async () => {
        twitchClientMock.getRawLiveStreams.mockResolvedValue([]);

        const result = await service.getTopEnrichedStreams(5);

        expect(result).toEqual([]);
        expect(twitchClientMock.getUsersProfiles).not.toHaveBeenCalled();
    });

    it("should deduplicate userIds before querying user profiles", async () => {
        const rawStream1 = EnrichedStreamMother.createRawStream({ id: "1", userId: "user1", viewerCount: 100, userName: "User One" });
        const rawStream2 = EnrichedStreamMother.createRawStream({ id: "2", userId: "user1", viewerCount: 500, userName: "User One Dup" });

        const profile1 = EnrichedStreamMother.createUserProfile({ id: "user1", displayName: "User One Enriched", profileImageUrl: "url1" });

        twitchClientMock.getRawLiveStreams.mockResolvedValue([rawStream1, rawStream2]);
        twitchClientMock.getUsersProfiles.mockResolvedValue([profile1]);

        const result = await service.getTopEnrichedStreams(2);

        expect(twitchClientMock.getUsersProfiles).toHaveBeenCalledWith(["user1"]);
        expect(result.length).toBe(2);
    });
});
