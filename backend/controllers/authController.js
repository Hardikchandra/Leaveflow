const db = require("../db/database");

// Default password for all demo users
const DEFAULT_PASSWORD = "123456";

// Handles user login by email and password
exports.login = (req, res) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  if (!password) {
    return res.status(400).json({ message: "Password is required" });
  }

  // Check password (all users have same password: 123456)
  if (password !== DEFAULT_PASSWORD) {
    return res.status(401).json({ message: "Invalid password" });
  }

  // Find user by email
  db.get(
    "SELECT id, name, email, role FROM users WHERE email = ?",
    [email],
    (err, user) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }

      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Return user data
      res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    }
  );
};

// Get user details by ID
exports.getUserById = (req, res) => {
  const userId = req.params.userId;

  db.get(
    "SELECT id, name, email, role FROM users WHERE id = ?",
    [userId],
    (err, user) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(user);
    }
  );
};