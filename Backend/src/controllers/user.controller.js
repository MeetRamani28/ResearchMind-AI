const User = require("../models/user.model");
const generateToken = require("../utils/generateToken");
const { sendWelcomeEmail } = require("../utils/emailService");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

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
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res.status(200).json({ success: true, message: "Logged out" });
};

// @desc Get Current User Profile
exports.getProfile = async (req, res) => {
  try {
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

// @desc Update Current User Profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (fullName) user.fullName = fullName;

    if (currentPassword && newPassword) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch)
        return res
          .status(400)
          .json({ success: false, message: "Incorrect password" });
      user.password = newPassword;
    }

    if (req.file) {
      try {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "avatars" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            },
          );
          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

        user.avatar = result.secure_url;
      } catch (cloudinaryError) {
        console.error("Cloudinary Upload Error:", cloudinaryError);
        return res
          .status(500)
          .json({ success: false, message: "Image upload failed" });
      }
    }

    await user.save();
    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ success: false, message: err.message });
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
