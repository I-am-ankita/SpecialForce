const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/errorHandler");

router.use(protect);

// Multiplication table drills
router.get("/tables", asyncHandler(async (req, res) => {
  const { from = 2, to = 20, count = 20 } = req.query;
  const questions = Array.from({ length: Number(count) }, (_, i) => {
    const table = Math.floor(Math.random() * (Number(to) - Number(from) + 1)) + Number(from);
    const num   = Math.floor(Math.random() * 12) + 1;
    return { id: i, question: `${table} × ${num} = ?`, answer: table * num };
  });
  res.json({ success: true, questions });
}));

// Speed math drills
router.get("/speed-math", asyncHandler(async (req, res) => {
  const { difficulty = "easy", count = 15 } = req.query;
  const maxNum = difficulty === "easy" ? 20 : difficulty === "medium" ? 50 : 100;
  const ops = ["+", "-", "×"];
  const questions = Array.from({ length: Number(count) }, (_, i) => {
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a = Math.floor(Math.random() * maxNum) + 1;
    let b = Math.floor(Math.random() * maxNum) + 1;
    let answer;
    if (op === "+") answer = a + b;
    else if (op === "-") { if (a < b) [a, b] = [b, a]; answer = a - b; }
    else { a = Math.floor(Math.random() * 12) + 1; b = Math.floor(Math.random() * 12) + 1; answer = a * b; }
    return { id: i, question: `${a} ${op} ${b} = ?`, answer };
  });
  res.json({ success: true, questions });
}));

module.exports = router;
