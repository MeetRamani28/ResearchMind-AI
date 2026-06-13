const { spawn } = require("child_process");
const path = require("path");

exports.runResearch = async (req, res) => {
  const io = req.app.get("io");
  const userId = req.user._id.toString();

  try {
    const { topic } = req.body;

    io.to(userId).emit("research-status", {
      message: "Search Agent started...",
    });

    const pythonScript = path.join(__dirname, "../ai_core/pipeline.py");
    const pythonProcess = spawn("python", [pythonScript, topic]);

    let dataResult = "";
    pythonProcess.stdout.on("data", (data) => {
      const output = data.toString();
      dataResult += output;
      if (output.includes("[STATUS]")) {
        io.to(userId).emit("research-status", {
          message: output.split("[STATUS]")[1]?.trim(),
        });
      }
    });

    pythonProcess.on("close", async (code) => {
      if (code === 0) {
        req.user.dailyPromptCount += 1;
        await req.user.save();

        const rawResult = dataResult.split("[FINAL_RESULT]")[1]?.trim();
        try {
          const parsedResult = JSON.parse(rawResult);
          io.to(userId).emit("research-complete", {
            success: true,
            data: parsedResult,
          });
          res.status(200).json({ success: true, data: parsedResult });
        } catch (e) {
          res
            .status(500)
            .json({ success: false, message: "Invalid JSON format from AI" });
        }
      } else {
        io.to(userId).emit("research-error", {
          message: "AI pipeline execution failed",
        });
        res.status(500).json({ success: false, message: "AI pipeline failed" });
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
