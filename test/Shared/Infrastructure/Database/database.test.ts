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

describe('SQLiteDatabaseAdapter.all', () => {
    const tempDbPath = path.resolve(__dirname, 'sqlite-adapter-all-test.sqlite');
    let adapter: SQLiteDatabaseAdapter;

    const removeTempDb = () => {
        if (fs.existsSync(tempDbPath)) {
            fs.unlinkSync(tempDbPath);
        }
    };

    beforeEach(async () => {
        removeTempDb();
        adapter = new SQLiteDatabaseAdapter(tempDbPath);
        await adapter.exec(`
            CREATE TABLE items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL
            );
        `);
    });

    afterEach(async () => {
        await adapter.close();
        removeTempDb();
    });

    it('should return an empty array when no rows match', async () => {
        const rows = await adapter.all<{ id: number; name: string }>('SELECT * FROM items');

        expect(Array.isArray(rows)).toBe(true);
        expect(rows).toHaveLength(0);
    });

    it('should return every matching row with the expected data', async () => {
        await adapter.run('INSERT INTO items (name) VALUES (?)', ['first']);
        await adapter.run('INSERT INTO items (name) VALUES (?)', ['second']);
        await adapter.run('INSERT INTO items (name) VALUES (?)', ['third']);

        const rows = await adapter.all<{ id: number; name: string }>('SELECT id, name FROM items ORDER BY id ASC');

        expect(rows).toHaveLength(3);
        expect(rows.map(row => row.name)).toEqual(['first', 'second', 'third']);
    });

    it('should apply the params filter and only return matching rows', async () => {
        await adapter.run('INSERT INTO items (name) VALUES (?)', ['apple']);
        await adapter.run('INSERT INTO items (name) VALUES (?)', ['banana']);
        await adapter.run('INSERT INTO items (name) VALUES (?)', ['apricot']);

        const rows = await adapter.all<{ id: number; name: string }>(
            'SELECT id, name FROM items WHERE name LIKE ? ORDER BY id ASC',
            ['a%']
        );

        expect(rows).toHaveLength(2);
        expect(rows.map(row => row.name)).toEqual(['apple', 'apricot']);
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
