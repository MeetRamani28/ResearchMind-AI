const express = require("express");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const cors = require("cors");

const userRoutes = require("./routes/user.routes");
const researchRoutes = require("./routes/research.routes");
const chatRoutes = require("./routes/chat.routes");
const paymentRoutes = require("./routes/payment.routes");

require("./config/passport");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(passport.initialize());

app.use("/api/auth", userRoutes);
app.use("/api/research", researchRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/payment", paymentRoutes);

app.get("/", (req, res) => {
  res.send("ResearchMind AI Backend is up and running! ✨");
});

module.exports = app;
