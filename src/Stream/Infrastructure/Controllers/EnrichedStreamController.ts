import { NextFunction, Request, Response } from 'express';
import { StreamService } from '../../Application/Services/StreamService';
import { parsePositiveIntQueryParam } from '../../../Shared/Infrastructure/Http/QueryParamParser';

export class EnrichedStreamController {
    constructor(
        private readonly streamService: StreamService
    ) {}

    public getTopEnrichedStreams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const limit = parsePositiveIntQueryParam(req.query.limit);

            if (limit === null || limit <= 0) {
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
            next(error);
        }
    };
}
