const express  = require("express");
const router   = express.Router();
const qCtrl    = require("../controllers/question.controller");
const { protect, restrictTo } = require("../middleware/auth");

router.use(protect);

// Order matters: specific routes before parameterized ones
router.get("/topics",       qCtrl.getTopicsAndSubtopics);
router.get("/most-wrong",   restrictTo("admin"), qCtrl.getMostWrongQuestions);
router.get("/",             qCtrl.getQuestions);
router.get("/:id",          qCtrl.getQuestion);

router.post("/",            restrictTo("admin"), qCtrl.createQuestion);
router.post("/bulk-upload", restrictTo("admin"), qCtrl.bulkUpload);
router.put("/:id",          restrictTo("admin"), qCtrl.updateQuestion);
router.delete("/:id",       restrictTo("admin"), qCtrl.deleteQuestion);

module.exports = router;
