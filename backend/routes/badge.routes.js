const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");
const { Badge } = require("../models/Note");
const { asyncHandler } = require("../middleware/errorHandler");

router.use(protect);

router.get("/", asyncHandler(async (req, res) => {
  const badges = await Badge.find({ isActive: true });
  res.json({ success: true, badges });
}));

module.exports = router;
