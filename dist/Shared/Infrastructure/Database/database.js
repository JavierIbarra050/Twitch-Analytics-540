"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseConnection = exports.MySQLDatabaseAdapter = exports.SQLiteDatabaseAdapter = void 0;
exports.getDatabase = getDatabase;
exports.closeDatabase = closeDatabase;
exports.initializeDatabase = initializeDatabase;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const promise_1 = __importDefault(require("mysql2/promise"));
const config_1 = require("../Config/config");
class SQLiteDatabaseAdapter {
    dbPath;
    type = 'sqlite';
    db = null;
    constructor(dbPath) {
        this.dbPath = dbPath;
    }
    async getConn() {
        if (!this.db) {
            sqlite3_1.default.verbose();
            this.db = await (0, sqlite_1.open)({
                filename: this.dbPath,
                driver: sqlite3_1.default.Database
            });
            await this.db.run('PRAGMA foreign_keys = ON');
        }
        return this.db;
    }
    async get(sql, params = []) {
        const conn = await this.getConn();
        const row = await conn.get(sql, params);
        return row || null;
    }
    async all(sql, params = []) {
        const conn = await this.getConn();
        return conn.all(sql, params);
    }
    async run(sql, params = []) {
        const conn = await this.getConn();
        const result = await conn.run(sql, params);
        return { lastID: result.lastID, changes: result.changes };
    }
    async exec(sql) {
        const conn = await this.getConn();
        await conn.exec(sql);
    }
    async close() {
        if (this.db) {
            await this.db.close();
            this.db = null;
        }
    }
}
exports.SQLiteDatabaseAdapter = SQLiteDatabaseAdapter;
class MySQLDatabaseAdapter {
    options;
    type = 'mysql';
    pool = null;
    constructor(options) {
        this.options = options;
    }
    getPool() {
        if (!this.pool) {
            this.pool = promise_1.default.createPool({
                ...this.options,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            });
        }
        return this.pool;
    }
    async get(sql, params = []) {
        const pool = this.getPool();
        const [rows] = await pool.execute(sql, params);
        if (Array.isArray(rows) && rows.length > 0) {
            return rows[0];
        }
        return null;
    }
    async all(sql, params = []) {
        const pool = this.getPool();
        const [rows] = await pool.execute(sql, params);
        return rows;
    }
    async run(sql, params = []) {
        const pool = this.getPool();
        const [result] = await pool.execute(sql, params);
        const res = result;
        return {
            lastID: res?.insertId,
            changes: res?.affectedRows
        };
    }
    async exec(sql) {
        const pool = this.getPool();
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);
        for (const statement of statements) {
            await pool.execute(statement);
        }
    }
    async close() {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
        }
    }
}
exports.MySQLDatabaseAdapter = MySQLDatabaseAdapter;
class DatabaseConnection {
    static instance = null;
    db = null;
    constructor() { }
    static getInstance() {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }
    async getConnection() {
        if (this.db) {
            return this.db;
        }
        const isTest = process.env.NODE_ENV === 'test' || !!process.env.DATABASE_PATH;
        if (!isTest && config_1.config.dbHost) {
            this.db = new MySQLDatabaseAdapter({
                host: config_1.config.dbHost,
                port: config_1.config.dbPort,
                user: config_1.config.dbUser,
                password: config_1.config.dbPassword,
                database: config_1.config.dbName
            });
        }
        else {
            this.db = new SQLiteDatabaseAdapter(config_1.config.databasePath);
        }
        return this.db;
    }
    async close() {
        if (this.db) {
            await this.db.close();
            this.db = null;
        }
    }
}
exports.DatabaseConnection = DatabaseConnection;
async function getDatabase() {
    return DatabaseConnection.getInstance().getConnection();
}
async function closeDatabase() {
    return DatabaseConnection.getInstance().close();
}
async function initializeDatabase() {
    const db = await getDatabase();
    if (db.type === 'mysql') {
        await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        api_key VARCHAR(255) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
        await db.exec(`
      CREATE TABLE IF NOT EXISTS user_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(255) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
        await db.exec(`
      CREATE TABLE IF NOT EXISTS game_cache (
        id INT AUTO_INCREMENT PRIMARY KEY,
        game_id VARCHAR(255) NOT NULL,
        game_name VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        total_videos VARCHAR(255) NOT NULL,
        total_views VARCHAR(255) NOT NULL,
        most_viewed_title VARCHAR(255) NOT NULL,
        most_viewed_views VARCHAR(255) NOT NULL,
        most_viewed_duration VARCHAR(255) NOT NULL,
        most_viewed_created_at VARCHAR(255) NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    }
    else {
        await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL UNIQUE,
        api_key TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS user_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
      CREATE TABLE IF NOT EXISTS game_cache (
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
    }
}
