const { spawn } = require("child_process");
const path = require("path");
const Chat = require("../models/chat.model");

exports.runResearch = async (req, res) => {
  const io = req.app.get("io");
  const userId = req.user._id.toString();
  const { topic, chatId } = req.body;

  try {
    const chat = await Chat.findOne({ _id: chatId, userId: req.user._id });
    if (!chat) return res.status(404).json({ message: "Chat not found" });

    if (chat.title === "New Research Chat") {
      chat.title = topic.substring(0, 40) + (topic.length > 40 ? "..." : "");
      await chat.save();
      io.to(userId).emit("chat-updated", { chatId, title: chat.title });
    }

    const pythonScript = path.join(__dirname, "../ai_core/pipeline.py");
    const pythonExecutable = path.join(
      __dirname,
      "../../.venv/Scripts/python.exe",
    );

    const pythonProcess = spawn(pythonExecutable, [pythonScript, topic]);

    let dataResult = "";

    pythonProcess.stdout.on("data", (data) => {
      const output = data.toString();
      dataResult += output;

      const lines = output.split("\n");
      lines.forEach((line) => {
        if (line.includes("[STATUS]")) {
          const cleanMsg = line.split("[STATUS]")[1]?.trim();
          if (cleanMsg)
            io.to(userId).emit("research-status", { message: cleanMsg });
        }
      });
    });

    pythonProcess.on("close", async (code) => {
      if (code === 0) {
        try {
          const parts = dataResult.split("[FINAL_RESULT]");
          if (parts.length < 2) throw new Error("Result tag not found");

          const parsedResult = JSON.parse(parts[1].trim());

          chat.messages.push(
            { role: "user", content: topic },
            { role: "ai", content: JSON.stringify(parsedResult) },
          );
          await chat.save();

          io.to(userId).emit("research-complete", { data: parsedResult });
        } catch (e) {
          io.to(userId).emit("research-error", {
            message: "Result Parsing Failed",
          });
        }
      } else {
        io.to(userId).emit("research-error", { message: "AI Pipeline Failed" });
      }
    });

    pythonProcess.stderr.on("data", (data) => {
      console.error(`[PYTHON_STDERR]: ${data.toString()}`);
    });

    res.status(202).json({ success: true, message: "Started" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
