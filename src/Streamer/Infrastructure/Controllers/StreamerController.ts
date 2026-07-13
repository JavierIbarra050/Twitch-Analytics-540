import { Request, Response } from 'express';
import { StreamerService } from "../../Application/Services/StreamerService";
import { TwitchUnauthorizedError } from "../../../Shared/Infrastructure/Twitch/TwitchUnauthorizedError";
import { StreamerNotFoundError } from "../../Domain/Errors/StreamerNotFoundError";

export class StreamerController {
    constructor ( 
        private readonly streamerService: StreamerService,
    ) { }

    public getStreamerById = async (req: Request, res: Response): Promise<void> => {
        try {
            const idParam = req.query.id;

            if (typeof idParam !== 'string' || !/^\d+$/.test(idParam)) {
                res.status(400).json({ error: "Invalid or missing 'id' parameter." });
                return;
            }

            const idParamNumber = parseInt(idParam, 10);

            const streamer = await this.streamerService.getStreamerById(idParamNumber);

            res.status(200).json({
                id: streamer.id.toString(),
                login: streamer.login,
                display_name: streamer.displayName,
                type: streamer.type,
                broadcaster_type: streamer.broadcasterType,
                description: streamer.description,
                profile_image_url: streamer.profileImageUrl,
                offline_image_url: streamer.offlineImageUrl,
                view_count: streamer.viewCount,
                created_at: streamer.createdAt.toISOString()
            });
            
        } catch (error) {
            if (error instanceof StreamerNotFoundError) {
                res.status(404).json({ error: "User not found." });
                return;
            }

            if (error instanceof TwitchUnauthorizedError) {
                res.status(401).json({ error: "Unauthorized. Twitch access token is invalid or has expired." });
                return;
            }

            res.status(500).json({ error: "Internal server error." });
        }
    }
}
