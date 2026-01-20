const db = require("./database");

/**
 * Seed users for demo purposes
 * Creates manager, HR, and employee accounts
 */
const users = [
  { name: "Manager User", email: "manager@leaveflow.com", role: "MANAGER" },
  { name: "HR User", email: "hr@leaveflow.com", role: "HR" },
  { name: "Hardik Chandra", email: "hardik@leaveflow.com", role: "EMPLOYEE" }
];

users.forEach((user) => {
  db.run(
    "INSERT OR IGNORE INTO users (name, email, role) VALUES (?, ?, ?)",
    [user.name, user.email, user.role],
    (err) => {
      if (err) {
        console.error(`Failed to insert ${user.email}:`, err);
      }
    }
  );
});

console.log("Users seeded successfully");
