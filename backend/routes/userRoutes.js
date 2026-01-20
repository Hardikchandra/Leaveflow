const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Get all users (for Manager)
router.get("/all", userController.getAllUsers);

// Get all employees (for HR)
router.get("/employees", userController.getEmployees);

// Create new user (Manager only)
router.post("/create", userController.createUser);

module.exports = router;
