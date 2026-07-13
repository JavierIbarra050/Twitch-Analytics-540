"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = require("./Shared/Infrastructure/Database/database");
const config_1 = require("./Shared/Infrastructure/Config/config");
const app_1 = require("./app");
const PORT = config_1.config.port;
(0, database_1.initializeDatabase)().then(() => {
    app_1.app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}).catch(error => {
    console.error('Fatal: Database initialization failed during startup:', error);
    process.exit(1);
});
