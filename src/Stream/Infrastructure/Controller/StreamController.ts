import { Request, Response } from 'express';
import { StreamService } from "../../Application/Services/StreamService";

export class StreamController {
    constructor (
        private readonly streamService: StreamService,
    ) { }

    private parseUserIds(idsParam: any): number[] {
        if (!idsParam) {
            return [];
        }

        if (Array.isArray(idsParam)) {
            return idsParam
                .map(id => parseInt(String(id)))
                .filter(id => !isNaN(id));
        }

        if (typeof idsParam === 'string') {
            return idsParam
                .split(',')
                .map(id => parseInt(id.trim()))
                .filter(id => !isNaN(id));
        }

        return [];
    }

    public getLiveStreams = async (req: Request, res: Response): Promise<void> => {
        try {
            const idsParam = req.query.ids;
            const userIds = this.parseUserIds(idsParam);

            if (userIds.length === 0) {
                res.status(400).json({ error: "Invalid or missing 'ids' parameter." });
                return;
            }

            const streams = await this.streamService.getLiveStreams(userIds);

            const responseData = streams.map(stream => ({
                title: stream.getTitle(),
                user_name: stream.getUserName()
            }));

            res.status(200).json(responseData);
            
        } catch (error: any) {
            if (error.message && error.message.includes("Unauthorized")) {
                res.status(401).json({ error: "Unauthorized. Twitch access token is invalid or has expired." });
                return;
            }

            res.status(500).json({ error: "Internal server error." });
        }
    }
}
