const express = require("express");
const router = express.Router();
const passport = require("passport");
const {
  register,
  login,
  logout,
  getProfile,
  oAuthSuccess,
  updateProfile,
} = require("../controllers/user.controller");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// 1. Local Auth Routes
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", protect, getProfile);
router.patch(
  "/update-profile",
  protect,
  upload.single("avatar"),
  updateProfile,
);

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
