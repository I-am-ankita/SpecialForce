/**
 * routes/user.routes.js
 */
const express = require("express");
const router  = express.Router();
const userController = require("../controllers/user.controller");
const { protect, restrictTo } = require("../middleware/auth");

// All user routes require authentication
router.use(protect);

router.get("/dashboard",             userController.getDashboard);
router.get("/profile/:id",           userController.getProfile);
router.patch("/profile",             userController.updateProfile);
router.post("/bookmark/:questionId", userController.toggleBookmark);

// Admin-only routes
router.get("/all",            restrictTo("admin"), userController.getAllUsers);
router.get("/team-analytics", restrictTo("admin"), userController.getTeamAnalytics);

module.exports = router;
