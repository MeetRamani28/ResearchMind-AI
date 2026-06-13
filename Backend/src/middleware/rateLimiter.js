const rateLimiter = async (req, res, next) => {
  const user = req.user;
  const today = new Date().toDateString();

  if (user.lastResetDate.toDateString() !== today) {
    user.dailyPromptCount = 0;
    user.lastResetDate = new Date();
  }

  const limits = { FREE: 20, BASIC: 50, PRO: 100, ENTERPRISE: 500 };
  const limit = limits[user.plan] || 20;

  if (user.dailyPromptCount >= limit) {
    return res.status(429).json({
      message: `Daily limit reached for ${user.plan} plan. Try again tomorrow.`,
    });
  }

  next();
};

module.exports = rateLimiter;
