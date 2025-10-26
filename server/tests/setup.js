const Database = require('better-sqlite3');

// Create in-memory test database
const mockTestDb = new Database(':memory:');
mockTestDb.pragma('foreign_keys = ON');

// Create tables
mockTestDb.exec(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

mockTestDb.exec(`
  CREATE TABLE tasks (
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

// Create trigger for updating timestamps
mockTestDb.exec(`
  CREATE TRIGGER update_tasks_timestamp 
  AFTER UPDATE ON tasks
  BEGIN
    UPDATE tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
  END
`);

// Mock the database module
jest.mock('../db', () => mockTestDb);

// Clean up after all tests
afterAll(() => {
  mockTestDb.close();
});