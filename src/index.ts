import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import analyticsRoutes from "./Streamer/Infrastructure/Routes/analyticsRoutes";
import userRoutes from "./User/Infrastructure/Routes/userRoutes";
import { initializeDatabase } from './Shared/Infrastructure/Database/database';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/analytics', analyticsRoutes);
app.use('/analytics', userRoutes);

initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch(error => {
    console.error(error);
});
