import type { Database as SQLiteDatabase } from 'sqlite';
import mysql from 'mysql2/promise';
import { config } from '../Config/config';

export interface IDatabase {
  type: 'sqlite' | 'mysql';
  get<T>(sql: string, params?: any[]): Promise<T | null>;
  all<T>(sql: string, params?: any[]): Promise<T[]>;
  run(sql: string, params?: any[]): Promise<{ lastID?: number; changes?: number }>;
  exec(sql: string): Promise<void>;
  close(): Promise<void>;
}

export class SQLiteDatabaseAdapter implements IDatabase {
  public readonly type = 'sqlite';
  private db: SQLiteDatabase | null = null;

  constructor(private readonly dbPath: string) {}

  private async getConn(): Promise<SQLiteDatabase> {
    if (!this.db) {
      const sqliteModule = await import('sqlite3');
      const sqlite3 = sqliteModule.default || (sqliteModule as any);
      const { open } = await import('sqlite');
      sqlite3.verbose();
      this.db = await open({
        filename: this.dbPath,
        driver: sqlite3.Database
      });
      await this.db.run('PRAGMA foreign_keys = ON');
    }
    return this.db;
  }

  async get<T>(sql: string, params: any[] = []): Promise<T | null> {
    const conn = await this.getConn();
    const row = await conn.get<T>(sql, params);
    return row || null;
  }

  async all<T>(sql: string, params: any[] = []): Promise<T[]> {
    const conn = await this.getConn();
    return conn.all<T[]>(sql, params);
  }

  async run(sql: string, params: any[] = []): Promise<{ lastID?: number; changes?: number }> {
    const conn = await this.getConn();
    const result = await conn.run(sql, params);
    return { lastID: result.lastID, changes: result.changes };
  }

  async exec(sql: string): Promise<void> {
    const conn = await this.getConn();
    await conn.exec(sql);
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

export class MySQLDatabaseAdapter implements IDatabase {
  public readonly type = 'mysql';
  private pool: mysql.Pool | null = null;

  constructor(private readonly options: mysql.PoolOptions) {}

  private getPool(): mysql.Pool {
    if (!this.pool) {
      this.pool = mysql.createPool({
        ...this.options,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
    }
    return this.pool;
  }

  async get<T>(sql: string, params: any[] = []): Promise<T | null> {
    const pool = this.getPool();
    const [rows] = await pool.execute(sql, params);
    if (Array.isArray(rows) && rows.length > 0) {
      return rows[0] as T;
    }
    return null;
  }

  async all<T>(sql: string, params: any[] = []): Promise<T[]> {
    const pool = this.getPool();
    const [rows] = await pool.execute(sql, params);
    return rows as T[];
  }

  async run(sql: string, params: any[] = []): Promise<{ lastID?: number; changes?: number }> {
    const pool = this.getPool();
    const [result] = await pool.execute(sql, params);
    const res = result as any;
    return {
      lastID: res?.insertId,
      changes: res?.affectedRows
    };
  }

  async exec(sql: string): Promise<void> {
    const pool = this.getPool();
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    for (const statement of statements) {
      await pool.execute(statement);
    }
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
    }
  }
}

export class DatabaseConnection {
  private static instance: DatabaseConnection | null = null;
  private db: IDatabase | null = null;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async getConnection(): Promise<IDatabase> {
    if (this.db) {
      return this.db;
    }

    const isTest = process.env.NODE_ENV === 'test' || !!process.env.DATABASE_PATH;
    if (!isTest && config.dbHost) {
      this.db = new MySQLDatabaseAdapter({
        host: config.dbHost,
        port: config.dbPort,
        user: config.dbUser,
        password: config.dbPassword,
        database: config.dbName
      });
    } else {
      this.db = new SQLiteDatabaseAdapter(config.databasePath);
    }

    return this.db;
  }

  public async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

export async function getDatabase(): Promise<IDatabase> {
  return DatabaseConnection.getInstance().getConnection();
}

export async function closeDatabase(): Promise<void> {
  return DatabaseConnection.getInstance().close();
}

export async function initializeDatabase(): Promise<void> {
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
  } else {
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
