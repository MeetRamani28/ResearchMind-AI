const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/user.model");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createOrder = async (req, res) => {
  try {
    const { plan } = req.body;

    const prices = { BASIC: 1900, PRO: 4900, ENTERPRISE: 9900 };
    const amount = prices[plan] || 0;

    if (amount === 0)
      return res.status(400).json({ success: false, message: "Invalid plan" });

    const options = {
      amount: amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } =
      req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    await User.findByIdAndUpdate(req.user._id, {
      plan: plan,
      "subscription.status": "active",
      "subscription.planExpiryDate": expiryDate,
      "subscription.razorpaySubscriptionId": razorpay_order_id,
    });

    res
      .status(200)
      .json({ success: true, message: "Plan upgraded successfully!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
