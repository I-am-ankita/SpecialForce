const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");
const userController = require("../controllers/user.controller");

router.use(protect);
router.get("/", userController.getLeaderboard);

module.exports = router;
