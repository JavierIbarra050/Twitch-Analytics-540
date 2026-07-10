import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

export class DatabaseConnection {
  private static instance: DatabaseConnection | null = null;
  private db: Database | null = null;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async getConnection(): Promise<Database> {
    if (this.db) {
      try {
        // Simple ping check to see if the connection is still alive/valid
        await this.db.get('SELECT 1');
        return this.db;
      } catch (error) {
        console.warn('Database connection check failed, attempting to reconnect...', error);
        await this.close();
      }
    }

    const dbPath = path.resolve(__dirname, '../../../../database.sqlite');
    sqlite3.verbose();

    this.db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });

    await this.db.run('PRAGMA foreign_keys = ON');
    return this.db;
  }

  public async close(): Promise<void> {
    if (this.db) {
      try {
        await this.db.close();
      } catch (error) {
        console.error('Error closing database connection:', error);
      } finally {
        this.db = null;
      }
    }
  }
}

export async function getDatabase(): Promise<Database> {
  return DatabaseConnection.getInstance().getConnection();
}

export async function closeDatabase(): Promise<void> {
  return DatabaseConnection.getInstance().close();
}

export async function initializeDatabase(): Promise<void> {
  const db = await getDatabase();

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
