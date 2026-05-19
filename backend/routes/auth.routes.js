/**
 * routes/auth.routes.js
 */
const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth");

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/me", protect, authController.getMe);
router.patch("/update-password", protect, authController.updatePassword);

module.exports = router;
