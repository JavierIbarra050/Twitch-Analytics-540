import { Request, Response } from 'express';
import { EnrichedStreamService } from '../../Application/Services/EnrichedStreamService';

export class EnrichedStreamController {
    constructor(
        private readonly service: EnrichedStreamService
    ) {}

    async getTopEnrichedStreams(req: Request, res: Response): Promise<void> {
        try {
            const limitParam = req.query.limit;

            if (!limitParam) {
                res.status(400).json({ error: "Invalid 'limit' parameter." });
                return;
            }

            const limit = parseInt(String(limitParam), 10);

            if (isNaN(limit) || limit <= 0) {
                res.status(400).json({ error: "Invalid 'limit' parameter." });
                return;
            }

            const streams = await this.service.getTopEnrichedStreams(limit);

            const response = streams.map(stream => ({
                stream_id: stream.getStreamId(),
                user_id: stream.getUserId(),
                user_name: stream.getUserName(),
                viewer_count: stream.getViewerCount(),
                title: stream.getTitle(),
                user_display_name: stream.getUserDisplayName(),
                profile_image_url: stream.getProfileImageUrl()
            }));

            res.status(200).json(response);
        } catch (error: any) {
            const status = error?.response?.status;
            if (status === 401 || error?.message?.includes('401') || error?.message?.includes('Unauthorized')) {
                res.status(401).json({ error: "Unauthorized. Twitch access token is invalid or has expired." });
                return;
            }

            res.status(500).json({ error: "Internal server error." });
        }
    }
}
