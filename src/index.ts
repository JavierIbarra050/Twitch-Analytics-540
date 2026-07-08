import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import analyticsRoutes from "./Streamer/Infrastructure/Routes/analyticsRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/analytics', analyticsRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
