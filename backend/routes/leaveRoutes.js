const express = require("express");
const router = express.Router();
const controller = require("../controllers/leaveController");

// Specific routes must come before parameterized routes
router.get("/pending/hr", controller.getPendingLeaves); // HR pending approvals
router.get("/pending/manager", controller.getManagerPendingLeaves); // Manager pending approvals
router.get("/recent-log", controller.getRecentLeaveLog); // Last 5 approved/rejected
router.get("/on-leave-today", controller.getOnLeaveToday); // Employees on leave today
router.post("/apply", controller.createLeave);
router.post("/hr-status", controller.updateHRStatus); // HR approval
router.post("/update-status", controller.updateLeaveStatus); // Manager approval
router.get("/balance/:userId", controller.getLeaveBalance);
router.get("/:userId", controller.getLeavesByUser);

module.exports = router;
