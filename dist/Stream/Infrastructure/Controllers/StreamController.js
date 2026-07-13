"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamController = void 0;
class StreamController {
    streamService;
    constructor(streamService) {
        this.streamService = streamService;
    }
    getLiveStreams = async (_req, res) => {
        try {
            const streams = await this.streamService.getLiveStreams();
            const responseData = streams.map(stream => ({
                title: stream.getTitle(),
                user_name: stream.getUserName()
            }));
            res.status(200).json(responseData);
        }
        catch (error) {
            if (error.message && error.message.includes("Unauthorized")) {
                res.status(401).json({ error: "Unauthorized. Twitch access token is invalid or has expired." });
                return;
            }
            res.status(500).json({ error: "Internal server error." });
        }
    };
}
exports.StreamController = StreamController;
