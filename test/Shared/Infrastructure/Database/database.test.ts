import path from 'path';
import fs from 'fs';
import {
    DatabaseConnection,
    SQLiteDatabaseAdapter,
    MySQLDatabaseAdapter,
    initializeDatabase
} from '../../../../src/Shared/Infrastructure/Database/database';
import { config } from '../../../../src/Shared/Infrastructure/Config/config';

describe('DatabaseConnection driver selection', () => {
    const originalDbHost = config.dbHost;
    const originalDatabasePath = process.env.DATABASE_PATH;

    afterEach(async () => {
        await DatabaseConnection.getInstance().close();
        (config as { dbHost?: string }).dbHost = originalDbHost;
        if (originalDatabasePath === undefined) {
            delete process.env.DATABASE_PATH;
        } else {
            process.env.DATABASE_PATH = originalDatabasePath;
        }
    });

    it('should select MySQL when dbHost is configured, even if DATABASE_PATH is also set', async () => {
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
});

describe('initializeDatabase game_cache migration', () => {
    const tempDbPath = path.resolve(__dirname, 'game-cache-migration-test.sqlite');
    const originalDbHost = config.dbHost;
    const originalDatabasePath = config.databasePath;

    const removeTempDb = () => {
        if (fs.existsSync(tempDbPath)) {
            fs.unlinkSync(tempDbPath);
        }
    };

    beforeEach(() => {
        removeTempDb();
    });

    afterEach(async () => {
        await DatabaseConnection.getInstance().close();
        (config as { dbHost?: string }).dbHost = originalDbHost;
        (config as { databasePath: string }).databasePath = originalDatabasePath;
        removeTempDb();
    });

    const createLegacyGameCacheTable = async () => {
        const legacyAdapter = new SQLiteDatabaseAdapter(tempDbPath);
        await legacyAdapter.exec(`
            CREATE TABLE game_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                game_id TEXT NOT NULL,
                game_name TEXT NOT NULL,
                user_name TEXT NOT NULL,
                total_videos TEXT NOT NULL,
                total_views TEXT NOT NULL,
                most_viewed_title TEXT NOT NULL,
                most_viewed_views TEXT NOT NULL,
                most_viewed_duration TEXT NOT NULL,
                most_viewed_created_at TEXT NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await legacyAdapter.run(
            `INSERT INTO game_cache (
                game_id, game_name, user_name, total_videos, total_views,
                most_viewed_title, most_viewed_views, most_viewed_duration, most_viewed_created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ['509658', 'Just Chatting', 'LCK', '4', '1000000', 'Title', '50000', '1h', '2026-07-09T00:00:00Z']
        );
        await legacyAdapter.close();
    };

    it('should add video_id and user_id columns to a pre-existing game_cache table without failing', async () => {
        await createLegacyGameCacheTable();

        (config as { dbHost?: string }).dbHost = undefined;
        (config as { databasePath: string }).databasePath = tempDbPath;

        await expect(initializeDatabase()).resolves.not.toThrow();

        const db = await DatabaseConnection.getInstance().getConnection();
        const columns = await db.all<{ name: string }>('PRAGMA table_info(game_cache)');
        const columnNames = columns.map(column => column.name);

        expect(columnNames).toEqual(expect.arrayContaining(['video_id', 'user_id']));

        const row = await db.get<{ video_id: string; user_id: string }>('SELECT video_id, user_id FROM game_cache');
        expect(row?.video_id).toBe('');
        expect(row?.user_id).toBe('');
    });

    it('should be idempotent when initializeDatabase runs again against an already-migrated table', async () => {
        await createLegacyGameCacheTable();

        (config as { dbHost?: string }).dbHost = undefined;
        (config as { databasePath: string }).databasePath = tempDbPath;

        await initializeDatabase();
        await DatabaseConnection.getInstance().close();

        await expect(initializeDatabase()).resolves.not.toThrow();

        const db = await DatabaseConnection.getInstance().getConnection();
        const columns = await db.all<{ name: string }>('PRAGMA table_info(game_cache)');
        const columnNames = columns.map(column => column.name);

        expect(columnNames.filter(name => name === 'video_id')).toHaveLength(1);
        expect(columnNames.filter(name => name === 'user_id')).toHaveLength(1);
    });

    it('should create game_cache with video_id and user_id already present for a brand new database', async () => {
        (config as { dbHost?: string }).dbHost = undefined;
        (config as { databasePath: string }).databasePath = tempDbPath;

        await initializeDatabase();

        const db = await DatabaseConnection.getInstance().getConnection();
        const columns = await db.all<{ name: string }>('PRAGMA table_info(game_cache)');
        const columnNames = columns.map(column => column.name);

        expect(columnNames).toEqual(expect.arrayContaining(['video_id', 'user_id']));
    });
});
