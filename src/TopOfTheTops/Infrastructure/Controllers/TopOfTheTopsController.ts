import { Request, Response } from "express";
import { TopOfTheTopsService } from "../../Application/Services/TopOfTheTopsService";
import { TwitchUnauthorizedError } from "../../../Shared/Infrastructure/Twitch/TwitchUnauthorizedError";

export class TopOfTheTopsController {
    constructor(private readonly service: TopOfTheTopsService) {}

    public getTopOfTheTops = async (req: Request, res: Response): Promise<void> => {
        try {
            const sinceQuery = req.query.since;
            let since: number | undefined;

            if (sinceQuery !== undefined) {
                if (typeof sinceQuery !== 'string' || !/^\d+$/.test(sinceQuery)) {
                    res.status(400).json({ error: "Bad Request. Invalid or missing parameters." });
                    return;
                }
                since = parseInt(sinceQuery, 10);
            }

            const stats = await this.service.getTopOfTheTops(since);
            if (stats.length === 0) {
                res.status(404).json({ error: "Not Found. No data available." });
                return;
            }

            const response = stats.map(stat => ({
                game_id: stat.getGameId(),
                game_name: stat.getGameName(),
                user_name: stat.getUserName(),
                total_videos: stat.getTotalVideos().toString(),
                total_views: stat.getTotalViews().toString(),
                most_viewed_title: stat.getMostViewedTitle(),
                most_viewed_views: stat.getMostViewedViews().toString(),
                most_viewed_duration: stat.getMostViewedDuration(),
                most_viewed_created_at: stat.getMostViewedCreatedAt()
            }));

            res.status(200).json(response);
        } catch (error) {
            if (error instanceof TwitchUnauthorizedError) {
                res.status(401).json({ error: "Unauthorized. Twitch access token is invalid or has expired." });
                return;
            }

            res.status(500).json({ error: "Internal Server Error. Please try again later." });
        }
    };
}
