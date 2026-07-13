import { Request, Response } from 'express';
import { StreamService } from "../../Application/Services/StreamService";
import { TwitchUnauthorizedError } from "../../../Shared/Infrastructure/Twitch/TwitchUnauthorizedError";

export class StreamController {
    constructor (
        private readonly streamService: StreamService,
    ) { }

    public getLiveStreams = async (_req: Request, res: Response): Promise<void> => {
        try {
            const streams = await this.streamService.getLiveStreams();

            const responseData = streams.map(stream => ({
                title: stream.getTitle(),
                user_name: stream.getUserName()
            }));

            res.status(200).json(responseData);

        } catch (error: any) {
            if (error instanceof TwitchUnauthorizedError) {
                res.status(401).json({ error: "Unauthorized. Twitch access token is invalid or has expired." });
                return;
            }

            res.status(500).json({ error: "Internal server error." });
        }
    }
}
