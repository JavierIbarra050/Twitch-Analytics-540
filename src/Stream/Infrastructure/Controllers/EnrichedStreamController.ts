import { Request, Response } from 'express';
import { StreamService } from '../../Application/Services/StreamService';
import { TwitchUnauthorizedError } from '../../../Shared/Infrastructure/Twitch/TwitchUnauthorizedError';

export class EnrichedStreamController {
    constructor(
        private readonly streamService: StreamService
    ) {}

    public getTopEnrichedStreams = async (req: Request, res: Response): Promise<void> => {
        try {
            const limitParam = req.query.limit;

            if (typeof limitParam !== 'string' || !/^\d+$/.test(limitParam)) {
                res.status(400).json({ error: "Invalid 'limit' parameter." });
                return;
            }

            const limit = parseInt(limitParam, 10);

            if (limit <= 0) {
                res.status(400).json({ error: "Invalid 'limit' parameter." });
                return;
            }

            const streams = await this.streamService.getTopEnrichedStreams(limit);

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
        } catch (error) {
            if (error instanceof TwitchUnauthorizedError) {
                res.status(401).json({ error: "Unauthorized. Twitch access token is invalid or has expired." });
                return;
            }

            res.status(500).json({ error: "Internal server error." });
        }
    };
}
