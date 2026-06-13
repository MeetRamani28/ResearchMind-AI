const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { 
        type: String, 
        default: "New Research Chat" 
    },
    messages: [
      {
        role: { 
            type: String, 
            enum: ["user", "ai"], 
            required: true 
        },
        content: String,
        timestamp: { 
            type: Date, 
            default: Date.now 
        },
      },
    ],
    promptCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Chat", chatSchema);
