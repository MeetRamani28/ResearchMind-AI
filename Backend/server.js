require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");
const app = require("./src/app");
const connectToDB = require("./src/config/database.connection");

const PORT = process.env.PORT || 3000;

// 1. Create HTTP server from Express app
const server = http.createServer(app);

// 2. Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// 3. Socket Connection Handling
io.on("connection", (socket) => {
  console.log(`⚡ User connected: ${socket.id}`);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User joined room: ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// 4. Make io accessible in controllers
app.set("io", io);

// 5. Start Server
const startServer = async () => {
  try {
    await connectToDB();

    server.listen(PORT, () => {
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
