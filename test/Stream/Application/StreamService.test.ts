import { StreamService } from "Stream/Application/Services/StreamService";
import { IStreamRepository } from "Stream/Domain/Repositories/IStreamRepository";
import { StreamMother } from "../Mothers/StreamMother";
import { EnrichedStreamMother } from "../Mothers/EnrichedStreamMother";

describe("StreamService", () => {
    let streamRepositoryMock: jest.Mocked<IStreamRepository>;
    let streamService: StreamService;

    beforeEach(() => {
        streamRepositoryMock = {
            getLiveStreams: jest.fn(),
            getRawLiveStreams: jest.fn(),
            getUsersProfiles: jest.fn(),
        };
        streamService = new StreamService(streamRepositoryMock);
    });

    describe("getLiveStreams", () => {
        it("should return the live streams when they exist", async () => {
            const expectedStreams = [
                StreamMother.create({ title: "Stream 1", userName: "Ibai" }),
                StreamMother.create({ title: "Stream 2", userName: "Auronplay" })
            ];

            streamRepositoryMock.getLiveStreams.mockResolvedValue(expectedStreams);

            const streams = await streamService.getLiveStreams();

            expect(streamRepositoryMock.getLiveStreams).toHaveBeenCalledWith(undefined);
            expect(streams).toEqual(expectedStreams);
        });

        it("should return an empty array when no streams are live", async () => {
            streamRepositoryMock.getLiveStreams.mockResolvedValue([]);

            const streams = await streamService.getLiveStreams();

            expect(streams).toEqual([]);
        });

        it("should propagate error when the repository fails", async () => {
            streamRepositoryMock.getLiveStreams.mockRejectedValue(new Error("Twitch Helix API error"));

            await expect(streamService.getLiveStreams()).rejects.toThrow("Twitch Helix API error");
        });

        it("should forward the given limit to the repository", async () => {
            const expectedStreams = [
                StreamMother.create({ title: "Stream 1", userName: "Ibai" })
            ];

            streamRepositoryMock.getLiveStreams.mockResolvedValue(expectedStreams);

            const streams = await streamService.getLiveStreams(1);

            expect(streamRepositoryMock.getLiveStreams).toHaveBeenCalledWith(1);
            expect(streams).toEqual(expectedStreams);
        });
    });

    describe("getTopEnrichedStreams", () => {
        it("should return empty array if limit is less than or equal to 0", async () => {
            const result = await streamService.getTopEnrichedStreams(0);
            expect(result).toEqual([]);
            expect(streamRepositoryMock.getRawLiveStreams).not.toHaveBeenCalled();
        });

        it("should fetch, sort, limit and enrich streams correctly", async () => {
            const rawStream1 = EnrichedStreamMother.createRawStream({ id: "1", userId: "user1", viewerCount: 100, userName: "User One" });
            const rawStream2 = EnrichedStreamMother.createRawStream({ id: "2", userId: "user2", viewerCount: 500, userName: "User Two" });
            const rawStream3 = EnrichedStreamMother.createRawStream({ id: "3", userId: "user3", viewerCount: 300, userName: "User Three" });

            const profile1 = EnrichedStreamMother.createUserProfile({ id: "user1", displayName: "User One Enriched", profileImageUrl: "url1" });
            const profile2 = EnrichedStreamMother.createUserProfile({ id: "user2", displayName: "User Two Enriched", profileImageUrl: "url2" });

            streamRepositoryMock.getRawLiveStreams.mockResolvedValue([rawStream1, rawStream2, rawStream3]);
            streamRepositoryMock.getUsersProfiles.mockResolvedValue([profile1, profile2]);

            const result = await streamService.getTopEnrichedStreams(2);

            expect(streamRepositoryMock.getRawLiveStreams).toHaveBeenCalledWith(100);
            expect(streamRepositoryMock.getUsersProfiles).toHaveBeenCalledWith(["user2", "user3"]);

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
            streamRepositoryMock.getRawLiveStreams.mockResolvedValue([]);
            streamRepositoryMock.getUsersProfiles.mockResolvedValue([]);

            await streamService.getTopEnrichedStreams(150);

            expect(streamRepositoryMock.getRawLiveStreams).toHaveBeenCalledWith(100);
        });

        it("should return empty array if no live streams are found", async () => {
            streamRepositoryMock.getRawLiveStreams.mockResolvedValue([]);

            const result = await streamService.getTopEnrichedStreams(5);

            expect(result).toEqual([]);
            expect(streamRepositoryMock.getUsersProfiles).not.toHaveBeenCalled();
        });

        it("should deduplicate userIds before querying user profiles", async () => {
            const rawStream1 = EnrichedStreamMother.createRawStream({ id: "1", userId: "user1", viewerCount: 100, userName: "User One" });
            const rawStream2 = EnrichedStreamMother.createRawStream({ id: "2", userId: "user1", viewerCount: 500, userName: "User One Dup" });

            const profile1 = EnrichedStreamMother.createUserProfile({ id: "user1", displayName: "User One Enriched", profileImageUrl: "url1" });

            streamRepositoryMock.getRawLiveStreams.mockResolvedValue([rawStream1, rawStream2]);
            streamRepositoryMock.getUsersProfiles.mockResolvedValue([profile1]);

            const result = await streamService.getTopEnrichedStreams(2);

            expect(streamRepositoryMock.getUsersProfiles).toHaveBeenCalledWith(["user1"]);
            expect(result.length).toBe(2);
        });
    });
});
