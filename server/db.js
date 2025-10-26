const Database = require('better-sqlite3');
const path = require('path');

// Create database connection
const db = new Database(path.join(__dirname, 'database.sqlite'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create users table
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create tasks table
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    due_date DATE,
    priority TEXT DEFAULT 'medium',
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
  )
`);

// Add new columns to existing tasks table (migration)
try {
  db.exec(`ALTER TABLE tasks ADD COLUMN due_date DATE`);
} catch (err) {
  if (!err.message.includes('duplicate column name')) {
    console.error('Error adding due_date column:', err);
  }
}

try {
  db.exec(`ALTER TABLE tasks ADD COLUMN priority TEXT DEFAULT 'medium'`);
} catch (err) {
  if (!err.message.includes('duplicate column name')) {
    console.error('Error adding priority column:', err);
  }
}

// Create trigger to update updated_at timestamp
db.exec(`
  CREATE TRIGGER IF NOT EXISTS update_tasks_timestamp 
  AFTER UPDATE ON tasks
  BEGIN
    UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END
`);

module.exports = db;
