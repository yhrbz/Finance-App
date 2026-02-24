import Database from 'better-sqlite3';
import path from 'path';

const db = new Database('finance.db');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    image TEXT,
    onboardingCompleted BOOLEAN DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS user_settings (
    userId TEXT PRIMARY KEY,
    theme TEXT DEFAULT 'light',
    currency TEXT DEFAULT 'BRL',
    language TEXT DEFAULT 'en',
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS onboarding (
    userId TEXT PRIMARY KEY,
    cashBalanceCents INTEGER DEFAULT 0,
    investedBalanceCents INTEGER DEFAULT 0,
    completedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS entries (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    date TEXT NOT NULL, -- yyyy-mm-dd
    monthKey TEXT NOT NULL, -- yyyy-mm
    incomeCents INTEGER DEFAULT 0,
    expenseCents INTEGER DEFAULT 0,
    investmentCents INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id),
    UNIQUE(userId, date)
  );
`);

export default db;
