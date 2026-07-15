import { NextFunction, Request, Response } from 'express';
import { StreamService } from "../../Application/Services/StreamService";
import { parsePositiveIntQueryParam } from "../../../Shared/Infrastructure/Http/QueryParamParser";

export class StreamController {
    constructor (
        private readonly streamService: StreamService,
    ) { }

    public getLiveStreams = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            let limit: number | undefined;

            if (req.query.limit !== undefined) {
                const parsedLimit = parsePositiveIntQueryParam(req.query.limit);

                if (parsedLimit === null || parsedLimit <= 0) {
                    res.status(400).json({ error: "Invalid 'limit' parameter." });
                    return;
                }

                limit = parsedLimit;
            }

            const streams = await this.streamService.getLiveStreams(limit);

            const responseData = streams.map(stream => ({
                title: stream.getTitle(),
                user_name: stream.getUserName()
            }));

            res.status(200).json(responseData);

        } catch (error) {
            next(error);
        }
    }
}
