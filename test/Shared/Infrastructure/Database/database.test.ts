import {
    DatabaseConnection,
    SQLiteDatabaseAdapter,
    MySQLDatabaseAdapter
} from '../../../../src/Shared/Infrastructure/Database/database';
import { config } from '../../../../src/Shared/Infrastructure/Config/config';

describe('DatabaseConnection driver selection', () => {
    const originalDbHost = config.dbHost;
    const originalDatabasePath = process.env.DATABASE_PATH;
    const originalNodeEnv = process.env.NODE_ENV;

    afterEach(async () => {
        await DatabaseConnection.getInstance().close();
        (config as { dbHost?: string }).dbHost = originalDbHost;
        process.env.NODE_ENV = originalNodeEnv;
        if (originalDatabasePath === undefined) {
            delete process.env.DATABASE_PATH;
        } else {
            process.env.DATABASE_PATH = originalDatabasePath;
        }
    });

    it('should select MySQL when dbHost is configured, even if DATABASE_PATH is also set', async () => {
        process.env.NODE_ENV = 'production';
        (config as { dbHost?: string }).dbHost = 'mysql-host';
        process.env.DATABASE_PATH = '/tmp/should-be-ignored.sqlite';

        const db = await DatabaseConnection.getInstance().getConnection();

        expect(db).toBeInstanceOf(MySQLDatabaseAdapter);
        expect(db.type).toBe('mysql');
    });

    it('should select SQLite when dbHost is not configured', async () => {
        (config as { dbHost?: string }).dbHost = undefined;

        const db = await DatabaseConnection.getInstance().getConnection();

        expect(db).toBeInstanceOf(SQLiteDatabaseAdapter);
        expect(db.type).toBe('sqlite');
    });

    it('should refuse to select MySQL when NODE_ENV is test, even if dbHost is configured', async () => {
        process.env.NODE_ENV = 'test';
        (config as { dbHost?: string }).dbHost = 'mysql-host';

        await expect(DatabaseConnection.getInstance().getConnection()).rejects.toThrow(
            'Refusing to connect to a MySQL host during tests — check environment isolation'
        );
    });
});
