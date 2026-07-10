import { initializeDatabase } from './Shared/Infrastructure/Database/database';
import { config } from './Shared/Infrastructure/Config/config';
import { app } from './app';

const PORT = config.port;

initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch(error => {
    console.error('Fatal: Database initialization failed during startup:', error);
    process.exit(1);
});
