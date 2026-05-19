const express    = require("express");
const router     = express.Router();
const quizCtrl   = require("../controllers/quiz.controller");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/questions",  quizCtrl.getQuizQuestions);
router.post("/submit",    quizCtrl.submitQuiz);
router.get("/history",    quizCtrl.getHistory);
router.get("/result/:id", quizCtrl.getResult);

module.exports = router;
