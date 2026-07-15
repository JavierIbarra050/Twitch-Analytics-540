import { NextFunction, Request, Response } from 'express';
import { StreamerService } from "../../Application/Services/StreamerService";
import { parsePositiveIntQueryParam } from '../../../Shared/Infrastructure/Http/QueryParamParser';

export class StreamerController {
    constructor (
        private readonly streamerService: StreamerService,
    ) { }

    public getStreamerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const idParamNumber = parsePositiveIntQueryParam(req.query.id);

            if (idParamNumber === null) {
                res.status(400).json({ error: "Invalid or missing 'id' parameter." });
                return;
            }

            const streamer = await this.streamerService.getStreamerById(idParamNumber);

            res.status(200).json({
                id: streamer.getId().toString(),
                login: streamer.getLogin(),
                display_name: streamer.getDisplayName(),
                type: streamer.getType(),
                broadcaster_type: streamer.getBroadcasterType(),
                description: streamer.getDescription(),
                profile_image_url: streamer.getProfileImageUrl(),
                offline_image_url: streamer.getOfflineImageUrl(),
                view_count: streamer.getViewCount(),
                created_at: streamer.getCreatedAt().toISOString()
            });

        } catch (error) {
            next(error);
        }
    }
}
