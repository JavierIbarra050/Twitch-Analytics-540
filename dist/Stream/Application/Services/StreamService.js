"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamService = void 0;
class StreamService {
    streamRepository;
    constructor(streamRepository) {
        this.streamRepository = streamRepository;
    }
    async getLiveStreams() {
        return await this.streamRepository.getLiveStreams();
    }
}
exports.StreamService = StreamService;
