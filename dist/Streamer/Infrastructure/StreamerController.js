"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StreamerController = void 0;
class StreamerController {
    streamerService;
    constructor(streamerService) {
        this.streamerService = streamerService;
    }
    getStreamerById = async (req, res) => {
        try {
            const idParam = req.query.id;
            if (!idParam || typeof idParam !== 'string') {
                res.status(400).json({ error: "Invalid or missing 'id' parameter." });
                return;
            }
            const parsedId = Number(idParam);
            if (isNaN(parsedId)) {
                res.status(400).json({ error: "Invalid or missing 'id' parameter." });
                return;
            }
            const streamer = await this.streamerService.getStreamerById(parsedId);
            res.status(200).json({
                id: streamer.getStreamerId().toString(),
                login: streamer.getDisplayName().toLowerCase().replace(/\s+/g, ''),
                display_name: streamer.getDisplayName(),
                type: streamer.getType(),
                broadcaster_type: streamer.getBreadcasterType(),
                description: streamer.getDescription(),
                profile_image_url: streamer.getProfileImageUrl(),
                offline_image_url: streamer.getOfflineImageUrl(),
                view_count: streamer.getViewCount(),
                created_at: streamer.getCreatedAt().toISOString()
            });
        }
        catch (error) {
            if (error.message && error.message.includes("not found")) {
                res.status(404).json({ error: "User not found." });
                return;
            }
            if (error.message && error.message.includes("Unauthorized")) {
                res.status(401).json({ error: "Unauthorized. Twitch access token is invalid or has expired." });
                return;
            }
            res.status(500).json({ error: "Internal server error." });
        }
    };
}
exports.StreamerController = StreamerController;
