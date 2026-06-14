const Chat = require("../models/chat.model");

exports.createChat = async (req, res) => {
  const newChat = await Chat.create({ userId: req.user._id });
  res.status(201).json(newChat);
};

exports.getChatHistory = async (req, res) => {
  const chats = await Chat.find({ userId: req.user._id }).sort({
    updatedAt: -1,
  });
  res.status(200).json(chats);
};

exports.updateChatTitle = async (req, res) => {
  const { title } = req.body;
  const chat = await Chat.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { title },
    { new: true },
  );
  res.status(200).json(chat);
};

exports.deleteChat = async (req, res) => {
  try {
    const deletedChat = await Chat.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deletedChat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Chat deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAllChats = async (req, res) => {
  try {
    await Chat.deleteMany({ userId: req.user._id });
    res
      .status(200)
      .json({ success: true, message: "All chats deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getChatDetails = async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!chat) return res.status(404).json({ message: "Chat not found" });
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
