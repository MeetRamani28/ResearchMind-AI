const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  register,
  login,
  logout,
  getProfile,
  oAuthSuccess,
} = require("../controllers/user.controller");
const { protect } = require("../middleware/authMiddleware");

// 1. Local Auth Routes
router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/me", protect, getProfile);

// 2. Google OAuth Routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  oAuthSuccess,
);

// 3. GitHub OAuth Routes
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
);
router.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login`,
  }),
  oAuthSuccess,
);

module.exports = router;
