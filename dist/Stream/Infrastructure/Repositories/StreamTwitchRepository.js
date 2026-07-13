"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamTwitchRepository = void 0;
const Stream_1 = require("../../Domain/Entities/Stream");
class StreamTwitchRepository {
    httpClient;
    constructor(httpClient) {
        this.httpClient = httpClient;
    }
    async getLiveStreams() {
        const response = await this.httpClient.get('streams', new URLSearchParams());
        return response.data.map((stream) => new Stream_1.Stream(stream.title, stream.user_name));
    }
}
exports.StreamTwitchRepository = StreamTwitchRepository;
