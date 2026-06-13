const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  createChat,
  getChatHistory,
  updateChatTitle,
  deleteChat,
  deleteAllChats,
} = require("../controllers/chat.controller");

router.use(protect);

router.post("/", createChat);

router.get("/history", getChatHistory);

router.patch("/:id", updateChatTitle);

router.delete("/:id", deleteChat);

router.delete("/", deleteAllChats);

module.exports = router;
