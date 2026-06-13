const User = require("../models/user.model");
const generateToken = require("../utils/generateToken");
const { sendWelcomeEmail } = require("../utils/emailService");

// @desc Register User (Local)
exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({
      fullName,
      email,
      password,
      provider: "local",
      plan: "FREE",
    });
    generateToken(res, user);

    sendWelcomeEmail(email, fullName).catch((err) => {
      console.error("Welcome email failed to send:", err);
    });
    
    res.status(201).json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// @desc Login User (Local)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isAccountActive) {
      return res.status(403).json({ message: "Account is suspended" });
    }

    generateToken(res, user);
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc Logout
exports.logout = (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// @desc Get Current User Profile
exports.getProfile = async (req, res) => {
  try {
    // req.user is populated by your protect/auth middleware
    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc OAuth Success Handler (Called after Passport strategy validates user)
exports.oAuthSuccess = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=no_user_found`,
      );
    }

    generateToken(res, req.user);

    // Redirect user to the frontend dashboard
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  } catch (err) {
    console.error("OAuth Error:", err);
    res.redirect(`${process.env.FRONTEND_URL}/login?error=oauth_failed`);
  }
};
