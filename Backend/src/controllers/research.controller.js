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

    if (chat.promptCount >= 15) {
      return res
        .status(429)
        .json({ success: false, message: "Limit reached (15/15)." });
    }

    const pythonScript = path.join(__dirname, "../ai_core/pipeline.py");
    const pythonProcess = spawn("python", [pythonScript, topic]);

    let dataResult = "";
    pythonProcess.stdout.on("data", (data) => {
      const output = data.toString();
      dataResult += output;

      // માત્ર [STATUS] વાળા મેસેજ મોકલો
      const lines = output.split("\n");
      lines.forEach((line) => {
        if (line.includes("[STATUS]")) {
          const msg = line.split("[STATUS]")[1].trim();
          io.to(userId).emit("research-status", { message: msg });
        }
      });
    });

    pythonProcess.on("close", async (code) => {
      if (code === 0) {
        // [FINAL_RESULT] પછીનો ભાગ પાર્સ કરો
        const rawResult = dataResult.split("[FINAL_RESULT]")[1]?.trim();
        try {
          const parsedResult = JSON.parse(rawResult);

          // જો ટાઈટલ ન હોય, તો ટોપિકને ટાઈટલ તરીકે સેવ કરો
          if (!chat.title || chat.title === "New Research Chat") {
            chat.title = topic.substring(0, 30);
          }

          chat.promptCount += 1;
          chat.messages.push(
            { role: "user", content: topic },
            { role: "ai", content: JSON.stringify(parsedResult) },
          );
          await chat.save();

          io.to(userId).emit("research-complete", {
            success: true,
            data: parsedResult,
          });
          // અહીં res.status(200) મોકલવાની જરૂર નથી કારણ કે આપણે socket થી રિઝલ્ટ મોકલીએ છીએ
        } catch (e) {
          io.to(userId).emit("research-error", {
            message: "Invalid JSON format",
          });
        }
      } else {
        io.to(userId).emit("research-error", { message: "AI pipeline failed" });
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
