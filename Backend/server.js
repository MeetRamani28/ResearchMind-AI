require("dotenv").config();
const app = require("./src/app");
const connectToDB = require("./src/config/database.connection");

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // 1. Establish Database Connection
    await connectToDB();

    // 2. Start Express Server
    app.listen(PORT, () => {
      console.log(
        `🚀 ResearchMind AI Backend running at http://localhost:${PORT}`,
      );
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
