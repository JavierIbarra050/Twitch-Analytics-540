import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import analyticsRoutes from "./Shared/Infrastructure/Routes/analyticsRoutes";
import userRoutes from "./User/Infrastructure/Routes/userRoutes";
import { TwitchUnauthorizedError } from './Shared/Infrastructure/Twitch/TwitchUnauthorizedError';
import { StreamerNotFoundError } from './Streamer/Domain/Errors/StreamerNotFoundError';
import { InvalidCredentialsError } from './User/Domain/Errors/InvalidCredentialsError';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/analytics', analyticsRoutes);
app.use(userRoutes);

app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not Found.' });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof StreamerNotFoundError) {
        res.status(404).json({ error: 'User not found.' });
        return;
    }

    if (err instanceof TwitchUnauthorizedError) {
        res.status(401).json({ error: 'Unauthorized. Twitch access token is invalid or has expired.' });
        return;
    }

    if (err instanceof InvalidCredentialsError) {
        res.status(401).json({ error: 'Unauthorized. API access token is invalid.' });
        return;
    }

    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
});

export { app };
