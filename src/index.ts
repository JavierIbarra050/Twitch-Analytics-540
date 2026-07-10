import express from 'express';
import cors from 'cors';
import analyticsRoutes from "./Streamer/Infrastructure/Routes/analyticsRoutes";
import userRoutes from "./User/Infrastructure/Routes/userRoutes";
import { initializeDatabase } from './Shared/Infrastructure/Database/database';
import { config } from './Shared/Infrastructure/Config/config';

const app = express();
const PORT = config.port;

app.use(cors());
app.use(express.json());

app.use('/analytics', analyticsRoutes);
app.use('/analytics', userRoutes);

initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch(error => {
    console.error('Fatal: Database initialization failed during startup:', error);
    process.exit(1);
});
