"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamerService = void 0;
class StreamerService {
    twitchRepository;
    constructor(twitchRepository) {
        this.twitchRepository = twitchRepository;
    }
    async getStreamerById(id) {
        const streamer = await this.twitchRepository.searchStreamerById(id);
        if (streamer === null) {
            throw new Error("Streamer with id: " + id + " not found");
        }
        return streamer;
    }
}
exports.StreamerService = StreamerService;
