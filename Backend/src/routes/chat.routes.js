const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const chatCtrl = require("../controllers/chat.controller");

router.use(protect);
router.post("/", chatCtrl.createChat);
router.get("/history", chatCtrl.getChatHistory);
router.get("/:id", chatCtrl.getChatDetails);
router.patch("/:id", chatCtrl.updateChatTitle);
router.delete("/:id", chatCtrl.deleteChat);
router.delete("/", chatCtrl.deleteAllChats);

module.exports = router;
