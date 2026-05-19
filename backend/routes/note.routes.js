const express  = require("express");
const router   = express.Router();
const { protect, restrictTo } = require("../middleware/auth");
const { Note } = require("../models/Note");
const { asyncHandler } = require("../middleware/errorHandler");

router.use(protect);

router.get("/", asyncHandler(async (req, res) => {
  const { topic, subtopic, noteType } = req.query;
  const filter = { isPublic: true };
  if (topic)    filter.topic    = topic;
  if (subtopic) filter.subtopic = subtopic;
  if (noteType) filter.noteType = noteType;
  const notes = await Note.find(filter).sort("topic subtopic").populate("createdBy", "name");
  res.json({ success: true, notes });
}));

router.get("/:id", asyncHandler(async (req, res) => {
  const note = await Note.findById(req.params.id).populate("createdBy", "name");
  if (!note) return res.status(404).json({ success: false, message: "Note not found." });
  res.json({ success: true, note });
}));

router.post("/", restrictTo("admin"), asyncHandler(async (req, res) => {
  const note = await Note.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json({ success: true, note });
}));

router.put("/:id", restrictTo("admin"), asyncHandler(async (req, res) => {
  const note = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, note });
}));

router.delete("/:id", restrictTo("admin"), asyncHandler(async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Note deleted." });
}));

module.exports = router;
