const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const rateLimiter = require("../middleware/rateLimiter");
const researchController = require("../controllers/research.controller");

// @route   POST /api/research/run
// @desc    Run AI Research Pipeline
// @access  Private (Needs login and rate limit check)
router.post("/run", protect, rateLimiter, researchController.runResearch);

module.exports = router;
