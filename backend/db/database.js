const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./leaveflow.db");

db.serialize(() => {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT CHECK(role IN ('MANAGER', 'HR', 'EMPLOYEE')) NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Leave balances
  db.run(`
  CREATE TABLE IF NOT EXISTS leave_balances (
    user_id INTEGER PRIMARY KEY,
    total_paid INTEGER DEFAULT 12,
    used_paid INTEGER DEFAULT 0,
    remaining_paid INTEGER DEFAULT 12,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS leave_balances (
    user_id INTEGER PRIMARY KEY,
    total_paid INTEGER DEFAULT 12,
    used_paid INTEGER DEFAULT 0,
    remaining_paid INTEGER DEFAULT 12,
    excess_paid_count INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`);

  // Leaves with approval workflow
  db.run(`
    CREATE TABLE IF NOT EXISTS leaves (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      leave_type TEXT CHECK(leave_type IN ('PAID', 'MEDICAL', 'EMERGENCY', 'UNPAID')),
      from_date TEXT,
      to_date TEXT,
      reason TEXT,
      approval_message TEXT,
      medical_certificate TEXT,
      status TEXT,
      status_color TEXT,
      hr_status TEXT DEFAULT 'PENDING',
      hr_comment TEXT,
      manager_status TEXT DEFAULT 'PENDING',
      manager_comment TEXT,
      created_at TEXT,
      FOREIGN KEY(user_id) REFERENCES users(id)
    )
  `);
});

module.exports = db;
