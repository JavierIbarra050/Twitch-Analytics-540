import express from 'express';
import cors from 'cors';
import analyticsRoutes from "./Streamer/Infrastructure/Routes/analyticsRoutes";
import userRoutes from "./User/Infrastructure/Routes/userRoutes";

const app = express();

app.use(cors());
app.use(express.json());

app.use('/analytics', analyticsRoutes);
app.use('/analytics', userRoutes);

export { app };
