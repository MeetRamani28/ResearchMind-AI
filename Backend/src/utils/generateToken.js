const jwt = require("jsonwebtoken");

const generateToken = (res, user) => {
  // 1. Create the JWT payload
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  // 2. Define cookie options
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true, // Prevents client-side JS from reading the cookie
    secure: process.env.NODE_ENV === "production", // Ensures cookie is sent only over HTTPS in production
    sameSite: "strict", // Protects against CSRF attacks
  };

  // 3. Set the cookie
  res.cookie("token", token, options);

  return token;
};

module.exports = generateToken;
