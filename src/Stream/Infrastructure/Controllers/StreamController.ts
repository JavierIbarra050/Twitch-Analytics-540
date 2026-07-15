import { NextFunction, Request, Response } from 'express';
import { StreamService } from "../../Application/Services/StreamService";

export class StreamController {
    constructor (
        private readonly streamService: StreamService,
    ) { }

    public getLiveStreams = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const streams = await this.streamService.getLiveStreams();

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
