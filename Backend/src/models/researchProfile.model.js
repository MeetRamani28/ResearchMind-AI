const mongoose = require("mongoose");

const researchPreferencesSchema = new mongoose.Schema(
  {
    topicsOfInterest: { type: [String], default: [] },
    preferredTone: {
      type: String,
      enum: ["academic", "casual", "business"],
      default: "academic",
    },
    language: { type: String, default: "en" },
  },
  { _id: false },
);

module.exports = researchPreferencesSchema;
