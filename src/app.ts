import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import analyticsRoutes from "./Shared/Infrastructure/Routes/analyticsRoutes";
import userRoutes from "./User/Infrastructure/Routes/userRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use('/analytics', analyticsRoutes);
app.use(userRoutes);

app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not Found.' });
});

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
});

export { app };
